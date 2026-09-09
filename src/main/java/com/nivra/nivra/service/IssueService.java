package com.nivra.nivra.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.IssueStatus;
import com.nivra.nivra.entity.IssueStatusHistory;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.IssueRepository;
import com.nivra.nivra.repository.IssueStatusHistoryRepository;
import com.nivra.nivra.repository.UserRepository;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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

    public List<IssueResponseDTO> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public IssueResponseDTO getIssueById(Long id) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue not found with id: " + id));

        return convertToResponseDTO(issue);
    }

    public IssueResponseDTO createIssue(IssueRequestDTO request) {

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());

        // Every new issue starts as NEW
        issue.setStatus(IssueStatus.NEW);

        issue.setPriority(request.getPriority());

        Issue savedIssue = issueRepository.save(issue);

        return convertToResponseDTO(savedIssue);
    }

    public IssueResponseDTO updateIssue(
            Long id,
            IssueRequestDTO request) {

        Issue existingIssue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue not found with id: " + id));

        existingIssue.setTitle(request.getTitle());
        existingIssue.setDescription(request.getDescription());
        existingIssue.setCategory(request.getCategory());
        existingIssue.setPriority(request.getPriority());

        Issue updatedIssue =
                issueRepository.save(existingIssue);

        return convertToResponseDTO(updatedIssue);
    }

    public IssueResponseDTO updateStatus(
            Long id,
            IssueStatus newStatus,
            String changedBy) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue not found with id: " + id));

        IssueStatus oldStatus = issue.getStatus();

        // Check whether the transition is allowed
        if (!isValidTransition(oldStatus, newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status transition: "
                            + oldStatus + " -> " + newStatus);
        }

        // Update issue status
        issue.setStatus(newStatus);

        Issue updatedIssue =
                issueRepository.save(issue);

        // Create status history
        IssueStatusHistory history =
                new IssueStatusHistory();

        history.setIssue(issue);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());

        issueStatusHistoryRepository.save(history);

        // Notify assigned worker
        if (issue.getAssignedTo() != null) {

            notificationService.createNotification(
                    issue.getAssignedTo(),
                    issue,
                    "Issue status changed to " + newStatus
            );
        }

        return convertToResponseDTO(updatedIssue);
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

    public IssueResponseDTO assignIssue(
            Long issueId,
            Long workerId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue not found with id: "
                                        + issueId));

        User worker = userRepository.findById(workerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Worker not found with id: "
                                        + workerId));

        // Only WORKER users can be assigned
        if (!"WORKER".equals(worker.getRole())) {

            throw new IllegalArgumentException(
                    "User is not a worker");
        }

        // Assign worker
        issue.setAssignedTo(worker);

        Issue savedIssue =
                issueRepository.save(issue);

        // Notify the worker
        notificationService.createNotification(
                worker,
                issue,
                "You have been assigned issue #"
                        + issue.getId()
        );

        return convertToResponseDTO(savedIssue);
    }

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

        return new IssueResponseDTO(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getCategory(),
                issue.getStatus(),
                issue.getPriority(),
                assignedWorkerId
        );
    }
}