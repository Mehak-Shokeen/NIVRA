package com.nivra.nivra.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nivra.nivra.dto.AssignIssueDTO;
import com.nivra.nivra.dto.DuplicateIssueResponseDTO;
import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.dto.NearbyIssueResponseDTO;
import com.nivra.nivra.dto.UpdateStatusDTO;
import com.nivra.nivra.entity.IssueStatus;
import com.nivra.nivra.repository.UserRepository;
import com.nivra.nivra.service.IssueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;
    private final UserRepository userRepository;

    public IssueController(
            IssueService issueService,
            UserRepository userRepository) {

        this.issueService = issueService;
        this.userRepository = userRepository;
    }

    // =========================
    // DUPLICATE CHECK
    // =========================

    @GetMapping("/check-duplicate")
    public DuplicateIssueResponseDTO checkDuplicate(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String category) {

        return issueService.checkDuplicate(
                latitude,
                longitude,
                category
        );
    }

    // =========================
    // NEARBY ISSUES
    // =========================

    @GetMapping("/nearby")
    public List<NearbyIssueResponseDTO> getNearbyIssues(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "500") double radius) {

        return issueService.getNearbyIssues(
                latitude,
                longitude,
                radius
        );
    }

    // =========================
    // AUTHORITY WORKERS
    // =========================

    @GetMapping("/workers")
    public List<Map<String, Object>> getWorkers(
            Authentication authentication) {

        boolean authorityOrAdmin =
                authentication.getAuthorities().stream()
                        .anyMatch(granted ->
                                "ROLE_AUTHORITY".equals(granted.getAuthority())
                                        || "ROLE_ADMIN".equals(granted.getAuthority()));

        if (!authorityOrAdmin) {
            throw new AccessDeniedException(
                    "Only authorities and administrators can view workers"
            );
        }

        return userRepository.findAll()
                .stream()
                .filter(user -> "WORKER".equals(user.getRole()))
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                ))
                .toList();
    }

    // =========================
    // GET / SEARCH / FILTER
    // =========================

    @GetMapping("/my")
    public List<IssueResponseDTO> getMyIssues(
            Authentication authentication) {

        return issueService.getMyIssues(authentication.getName());
    }

    @GetMapping("/assigned")
    public List<IssueResponseDTO> getAssignedIssues(
            Authentication authentication) {

        return issueService.getAssignedIssues(authentication.getName());
    }

    @GetMapping
    public Page<IssueResponseDTO> getIssues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            Pageable pageable) {

        return issueService.getIssues(
                search,
                status,
                category,
                priority,
                pageable
        );
    }

    @GetMapping("/{id}")
    public IssueResponseDTO getIssueById(
            @PathVariable Long id) {

        return issueService.getIssueById(id);
    }

    // =========================
    // CREATE
    // =========================

    @PostMapping
    public IssueResponseDTO createIssue(
            @Valid @RequestBody IssueRequestDTO request,
            Authentication authentication) {

        return issueService.createIssue(
                request,
                authentication.getName()
        );
    }

    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public IssueResponseDTO updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequestDTO request) {

        return issueService.updateIssue(id, request);
    }

    // =========================
    // STATUS
    // =========================

    @PatchMapping("/{id}/status")
    public IssueResponseDTO updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusDTO request,
            Authentication authentication) {

        return issueService.updateStatus(
                id,
                request.getStatus(),
                authentication.getName()
        );
    }

    // =========================
    // ASSIGN
    // =========================

    @PatchMapping("/{id}/assign")
    public IssueResponseDTO assignIssue(
            @PathVariable Long id,
            @Valid @RequestBody AssignIssueDTO request) {

        return issueService.assignIssue(
                id,
                request.getWorkerId()
        );
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public void deleteIssue(
            @PathVariable Long id) {

        issueService.deleteIssue(id);
    }
}
