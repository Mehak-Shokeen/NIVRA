package com.nivra.nivra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.IssueStatus;

public interface IssueRepository
        extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    List<Issue> findByReportedByIdOrderByIdDesc(Long userId);

    List<Issue> findByAssignedToIdOrderByIdDesc(Long workerId);

    long countByStatus(IssueStatus status);

    @Query(value = """
            SELECT i.id AS id, i.title AS title, i.description AS description,
                   i.category AS category, i.status AS status, i.priority AS priority,
                   i.assigned_to AS assignedTo, ST_Y(i.location) AS latitude,
                   ST_X(i.location) AS longitude,
                   ST_Distance(i.location::geography,
                     ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography) AS distanceMeters
            FROM issues i
            WHERE i.location IS NOT NULL
            AND ST_DWithin(i.location::geography,
              ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)
            ORDER BY distanceMeters
            """, nativeQuery = true)
    List<NearbyIssueProjection> findNearbyIssues(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("radius") double radius);

    @Query(value = """
            SELECT i.id AS id, i.title AS title, i.category AS category,
                   i.status AS status,
                   ST_Distance(i.location::geography,
                     ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography) AS distanceMeters
            FROM issues i
            WHERE i.location IS NOT NULL
            AND LOWER(i.category) = LOWER(:category)
            AND i.status <> 'RESOLVED'
            AND ST_DWithin(i.location::geography,
              ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)
            ORDER BY distanceMeters
            LIMIT 1
            """, nativeQuery = true)
    DuplicateIssueProjection findPossibleDuplicate(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("category") String category,
            @Param("radius") double radius);
}
