package com.nivra.nivra.service;

import java.time.LocalDateTime;
import java.util.List;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.CachedIssueResponseDTO;
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

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final IssueCacheService issueCacheService;

    private final GeometryFactory geometryFactory =
            new GeometryFactory(
                    new PrecisionModel(),
                    4326
            );

    public IssueService(
            IssueRepository issueRepository,
            IssueStatusHistoryRepository issueStatusHistoryRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            IssueCacheService issueCacheService) {

        this.issueRepository = issueRepository;
        this.issueStatusHistoryRepository =
                issueStatusHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.issueCacheService = issueCacheService;
    }

    public List<IssueResponseDTO> getMyIssues(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );

        return issueRepository
                .findByReportedByIdOrderByIdDesc(user.getId())
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public List<IssueResponseDTO> getAssignedIssues(String email) {

        User worker = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );

        if (!"WORKER".equals(worker.getRole())) {
            throw new IllegalArgumentException(
                    "Only workers can view assigned issues"
            );
        }

        return issueRepository
                .findByAssignedToIdOrderByIdDesc(worker.getId())
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }


    public Page<IssueResponseDTO> getIssues(
            String search,
            IssueStatus status,
            String category,
            String priority,
            Pageable pageable) {

        CachedIssueResponseDTO cached =
                issueCacheService.getCachedIssues(
                        search,
                        status,
                        category,
                        priority,
                        pageable
                );

        return new PageImpl<>(
                cached.getContent(),
                pageable,
                cached.getTotalElements()
        );
    }

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

    public IssueResponseDTO getIssueById(Long id) {

        Issue issue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id
                                )
                        );

        return convertToResponseDTO(issue);
    }

    @CacheEvict(value = "issues", allEntries = true)
    public IssueResponseDTO createIssue(
            IssueRequestDTO request,
            String reporterEmail) {

        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + reporterEmail
                        )
                );

        Issue issue = new Issue();
        issue.setReportedBy(reporter);

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setStatus(IssueStatus.NEW);
        issue.setPriority(request.getPriority());

        if (request.getLatitude() != null
                && request.getLongitude() != null) {

            Point point =
                    geometryFactory.createPoint(
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

    @CacheEvict(value = "issues", allEntries = true)
    public IssueResponseDTO updateIssue(
            Long id,
            IssueRequestDTO request) {

        Issue existingIssue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id
                                )
                        );

        existingIssue.setTitle(request.getTitle());
        existingIssue.setDescription(request.getDescription());
        existingIssue.setCategory(request.getCategory());
        existingIssue.setPriority(request.getPriority());

        if (request.getLatitude() != null
                && request.getLongitude() != null) {

            Point point =
                    geometryFactory.createPoint(
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

    @CacheEvict(value = "issues", allEntries = true)
    public IssueResponseDTO updateStatus(
            Long id,
            IssueStatus newStatus,
            String changedBy) {

        Issue issue =
                issueRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + id
                                )
                        );

        IssueStatus oldStatus =
                issue.getStatus();

        User actor = userRepository.findByEmail(changedBy)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + changedBy
                        )
                );

        if ("WORKER".equals(actor.getRole())) {
            if (issue.getAssignedTo() == null
                    || !issue.getAssignedTo().getId().equals(actor.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Workers can only update issues assigned to them"
                );
            }
        }

        if (!isValidTransition(
                oldStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status transition: "
                            + oldStatus
                            + " -> "
                            + newStatus
            );
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
                LocalDateTime.now()
        );

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
                updatedIssue
        );
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

    @CacheEvict(value = "issues", allEntries = true)
    public IssueResponseDTO assignIssue(
            Long issueId,
            Long workerId) {

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + issueId
                                )
                        );

        User worker =
                userRepository.findById(workerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker not found with id: "
                                                + workerId
                                )
                        );

        if (!"WORKER".equals(
                worker.getRole())) {

            throw new IllegalArgumentException(
                    "User is not a worker"
            );
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
                savedIssue
        );
    }

    @CacheEvict(value = "issues", allEntries = true)
    public void deleteIssue(Long id) {

        issueRepository.deleteById(id);
    }

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
                longitude,
                issue.getImageUrl()
        );
    }

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