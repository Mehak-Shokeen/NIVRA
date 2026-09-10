package com.nivra.nivra.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import com.nivra.nivra.service.IssueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
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
    // GET / SEARCH / FILTER
    // =========================

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

    @PostMapping
    public IssueResponseDTO createIssue(
            @Valid @RequestBody IssueRequestDTO request) {

        return issueService.createIssue(request);
    }

    @PutMapping("/{id}")
    public IssueResponseDTO updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequestDTO request) {

        return issueService.updateIssue(id, request);
    }

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

    @PatchMapping("/{id}/assign")
    public IssueResponseDTO assignIssue(
            @PathVariable Long id,
            @Valid @RequestBody AssignIssueDTO request) {

        return issueService.assignIssue(
                id,
                request.getWorkerId()
        );
    }

    @DeleteMapping("/{id}")
    public void deleteIssue(
            @PathVariable Long id) {

        issueService.deleteIssue(id);
    }
}