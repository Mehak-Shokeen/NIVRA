package com.nivra.nivra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nivra.nivra.entity.IssueStatusHistory;

import java.util.List;

public interface AnalyticsRepository extends JpaRepository<IssueStatusHistory, Long> {

    @Query(value = """
            SELECT COUNT(*)
            FROM issues
            """, nativeQuery = true)
    long countTotalIssues();

    @Query(value = """
            SELECT COUNT(*)
            FROM issues
            WHERE status = 'NEW'
            """, nativeQuery = true)
    long countNewIssues();

    @Query(value = """
            SELECT COUNT(*)
            FROM issues
            WHERE status IN ('VERIFIED', 'ASSIGNED', 'IN_PROGRESS')
            """, nativeQuery = true)
    long countActiveIssues();

    @Query(value = """
            SELECT COUNT(*)
            FROM issues
            WHERE status = 'RESOLVED'
            """, nativeQuery = true)
    long countResolvedIssues();

    @Query(value = """
            SELECT COUNT(*)
            FROM issues
            WHERE assigned_to IS NULL
            AND status <> 'RESOLVED'
            """, nativeQuery = true)
    long countUnassignedIssues();

    @Query(value = """
            SELECT category, COUNT(*) AS issue_count
            FROM issues
            GROUP BY category
            ORDER BY issue_count DESC
            """, nativeQuery = true)
    List<Object[]> countByCategory();

    @Query(value = """
            SELECT status, COUNT(*) AS issue_count
            FROM issues
            GROUP BY status
            ORDER BY issue_count DESC
            """, nativeQuery = true)
    List<Object[]> countByStatus();

    @Query(value = """
            SELECT priority, COUNT(*) AS issue_count
            FROM issues
            GROUP BY priority
            ORDER BY issue_count DESC
            """, nativeQuery = true)
    List<Object[]> countByPriority();

    @Query(value = """
            SELECT
                TO_CHAR(DATE_TRUNC('month', changed_at), 'Mon YYYY') AS month_label,
                COUNT(*) AS transition_count
            FROM issue_status_history
            WHERE changed_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
            GROUP BY DATE_TRUNC('month', changed_at)
            ORDER BY DATE_TRUNC('month', changed_at)
            """, nativeQuery = true)
    List<Object[]> activityTrend();

    @Query(value = """
            SELECT
                u.id,
                u.name,
                COUNT(i.id) AS total_assigned,
                COUNT(i.id) FILTER (
                    WHERE i.status IN ('ASSIGNED', 'IN_PROGRESS')
                ) AS active,
                COUNT(i.id) FILTER (
                    WHERE i.status = 'RESOLVED'
                ) AS resolved
            FROM users u
            LEFT JOIN issues i ON i.assigned_to = u.id
            WHERE u.role = 'WORKER'
            GROUP BY u.id, u.name
            ORDER BY total_assigned DESC, u.name
            """, nativeQuery = true)
    List<Object[]> workerWorkload();

    @Query(value = """
            SELECT
                ROUND(ST_Y(location)::numeric, 2) AS latitude,
                ROUND(ST_X(location)::numeric, 2) AS longitude,
                COUNT(*) AS issue_count
            FROM issues
            WHERE location IS NOT NULL
            GROUP BY
                ROUND(ST_Y(location)::numeric, 2),
                ROUND(ST_X(location)::numeric, 2)
            HAVING COUNT(*) >= 2
            ORDER BY issue_count DESC
            LIMIT 8
            """, nativeQuery = true)
    List<Object[]> hotspots();

    @Query(value = """
            WITH first_change AS (
                SELECT
                    issue_id,
                    MIN(changed_at) AS first_changed_at
                FROM issue_status_history
                GROUP BY issue_id
            ),
            resolved_change AS (
                SELECT
                    issue_id,
                    MIN(changed_at) AS resolved_at
                FROM issue_status_history
                WHERE new_status = 'RESOLVED'
                GROUP BY issue_id
            )
            SELECT AVG(
                EXTRACT(EPOCH FROM (r.resolved_at - f.first_changed_at)) / 3600.0
            )
            FROM first_change f
            JOIN resolved_change r
                ON r.issue_id = f.issue_id
            """, nativeQuery = true)
    Double averageResolutionHours();
}
