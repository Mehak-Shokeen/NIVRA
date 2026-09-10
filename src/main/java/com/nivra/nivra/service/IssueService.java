package com.nivra.nivra.service;

import java.time.LocalDateTime;
import java.util.List;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.DuplicateIssueResponseDTO;
import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.dto.NearbyIssueResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.IssueStatus;
import com.nivra.nivra.entity.IssueStatusHistory;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.DuplicateIssueProjection;
import com.nivra.nivra.repository.IssueRepository;
import com.nivra.nivra.repository.IssueStatusHistoryRepository;
import com.nivra.nivra.repository.NearbyIssueProjection;
import com.nivra.nivra.repository.UserRepository;
import com.nivra.nivra.specification.IssueSpecification;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private final GeometryFactory geometryFactory =
            new GeometryFactory(
                    new PrecisionModel(),
                    4326
            );

    public IssueService(
            IssueRepository issueRepository,
            IssueStatusHistoryRepository issueStatusHistoryRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.issueRepository = issueRepository;
        this.issueStatusHistoryRepository =
                issueStatusHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // =========================
    // GET / SEARCH / FILTER
    // =========================

    public Page<IssueResponseDTO> getIssues(
            String search,
            IssueStatus status,
            String category,
            String priority,
            Pageable pageable) {

        Specification<Issue> specification =
                (root, query, criteriaBuilder) -> null;

        if (search != null && !search.isBlank()) {
            specification = specification.and(
                    IssueSpecification.containsText(search)
            );
        }

        if (status != null) {
            specification = specification.and(
                    IssueSpecification.hasStatus(status)
            );
        }

        if (category != null && !category.isBlank()) {
            specification = specification.and(
                    IssueSpecification.hasCategory(category)
            );
        }

        if (priority != null && !priority.isBlank()) {
            specification = specification.and(
                    IssueSpecification.hasPriority(priority)
            );
        }

        return issueRepository
                .findAll(specification, pageable)
                .map(this::convertToResponseDTO);
    }

    // =========================
    // NEARBY ISSUES
    // =========================

    public List<NearbyIssueResponseDTO> getNearbyIssues(
            double latitude,
            double longitude,
            double radius) {

        validateCoordinates(
                latitude,
                longitude,
                radius
        );

        List<NearbyIssueProjection> results =
                issueRepository.findNearbyIssues(
                        latitude,
                        longitude,
                        radius
                );

        return results.stream()
                .map(this::convertToNearbyResponse)
                .toList();
    }

    // =========================
    // DUPLICATE CHECK
    // =========================

    public DuplicateIssueResponseDTO checkDuplicate(
            double latitude,
            double longitude,
            String category) {

        validateCoordinates(
                latitude,
                longitude,
                50
        );

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        DuplicateIssueProjection result =
                issueRepository.findPossibleDuplicate(
                        latitude,
                        longitude,
                        category,
                        50
                );

        if (result == null) {

            return new DuplicateIssueResponseDTO(
                    false,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }

        return new DuplicateIssueResponseDTO(
                true,
                result.getId(),
                result.getTitle(),
                result.getCategory(),
                result.getStatus(),
                result.getDistanceMeters()
        );
    }

    private void validateCoordinates(
            double latitude,
            double longitude,
            double radius) {

        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException(
                    "Latitude must be between -90 and 90"
            );
        }

        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException(
                    "Longitude must be between -180 and 180"
            );
        }

        if (radius <= 0) {
            throw new IllegalArgumentException(
                    "Radius must be greater than 0"
            );
        }
    }

    // =========================
    // GET BY ID
    // =========================

    public IssueResponseDTO getIssueById(Long id) {

        Issue issue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id));

        return convertToResponseDTO(issue);
    }

    // =========================
    // CREATE
    // =========================

    public IssueResponseDTO createIssue(
            IssueRequestDTO request) {

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setStatus(IssueStatus.NEW);
        issue.setPriority(request.getPriority());

        if (request.getLatitude() != null
                && request.getLongitude() != null) {

            Point point = geometryFactory.createPoint(
                    new Coordinate(
                            request.getLongitude(),
                            request.getLatitude()
                    )
            );

            point.setSRID(4326);

            issue.setLocation(point);
        }

        Issue savedIssue =
                issueRepository.save(issue);

        return convertToResponseDTO(savedIssue);
    }

    // =========================
    // UPDATE
    // =========================

    public IssueResponseDTO updateIssue(
            Long id,
            IssueRequestDTO request) {

        Issue existingIssue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id));

        existingIssue.setTitle(request.getTitle());
        existingIssue.setDescription(request.getDescription());
        existingIssue.setCategory(request.getCategory());
        existingIssue.setPriority(request.getPriority());

        if (request.getLatitude() != null
                && request.getLongitude() != null) {

            Point point = geometryFactory.createPoint(
                    new Coordinate(
                            request.getLongitude(),
                            request.getLatitude()
                    )
            );

            point.setSRID(4326);

            existingIssue.setLocation(point);
        }

        Issue updatedIssue =
                issueRepository.save(existingIssue);

        return convertToResponseDTO(updatedIssue);
    }

    // =========================
    // STATUS UPDATE
    // =========================

    public IssueResponseDTO updateStatus(
            Long id,
            IssueStatus newStatus,
            String changedBy) {

        Issue issue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id));

        IssueStatus oldStatus =
                issue.getStatus();

        if (!isValidTransition(
                oldStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status transition: "
                            + oldStatus
                            + " -> "
                            + newStatus);
        }

        issue.setStatus(newStatus);

        Issue updatedIssue =
                issueRepository.save(issue);

        IssueStatusHistory history =
                new IssueStatusHistory();

        history.setIssue(issue);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setChangedAt(
                LocalDateTime.now());

        issueStatusHistoryRepository.save(history);

        if (issue.getAssignedTo() != null) {

            notificationService.createNotification(
                    issue.getAssignedTo(),
                    issue,
                    "Issue status changed to "
                            + newStatus
            );
        }

        return convertToResponseDTO(
                updatedIssue);
    }

    private boolean isValidTransition(
            IssueStatus current,
            IssueStatus next) {

        return switch (current) {

            case NEW ->
                    next == IssueStatus.VERIFIED;

            case VERIFIED ->
                    next == IssueStatus.ASSIGNED;

            case ASSIGNED ->
                    next == IssueStatus.IN_PROGRESS;

            case IN_PROGRESS ->
                    next == IssueStatus.RESOLVED;

            case RESOLVED ->
                    false;
        };
    }

    // =========================
    // ASSIGN ISSUE
    // =========================

    public IssueResponseDTO assignIssue(
            Long issueId,
            Long workerId) {

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + issueId));

        User worker =
                userRepository.findById(workerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker not found with id: "
                                                + workerId));

        if (!"WORKER".equals(
                worker.getRole())) {

            throw new IllegalArgumentException(
                    "User is not a worker");
        }

        issue.setAssignedTo(worker);

        Issue savedIssue =
                issueRepository.save(issue);

        notificationService.createNotification(
                worker,
                issue,
                "You have been assigned issue #"
                        + issue.getId()
        );

        return convertToResponseDTO(
                savedIssue);
    }

    // =========================
    // DELETE
    // =========================

    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }

    // =========================
    // NORMAL RESPONSE
    // =========================

    private IssueResponseDTO convertToResponseDTO(
            Issue issue) {

        Long assignedWorkerId = null;

        if (issue.getAssignedTo() != null) {
            assignedWorkerId =
                    issue.getAssignedTo().getId();
        }

        Double latitude = null;
        Double longitude = null;

        if (issue.getLocation() != null) {
            latitude =
                    issue.getLocation().getY();

            longitude =
                    issue.getLocation().getX();
        }

        return new IssueResponseDTO(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getCategory(),
                issue.getStatus(),
                issue.getPriority(),
                assignedWorkerId,
                latitude,
                longitude
        );
    }

    // =========================
    // NEARBY RESPONSE
    // =========================

    private NearbyIssueResponseDTO convertToNearbyResponse(
            NearbyIssueProjection result) {

        return new NearbyIssueResponseDTO(
                result.getId(),
                result.getTitle(),
                result.getDescription(),
                result.getCategory(),
                result.getStatus(),
                result.getPriority(),
                result.getAssignedTo(),
                result.getLatitude(),
                result.getLongitude(),
                result.getDistanceMeters()
        );
    }
}