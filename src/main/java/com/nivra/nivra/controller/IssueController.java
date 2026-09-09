package com.nivra.nivra.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nivra.nivra.dto.AssignIssueDTO;
import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.dto.UpdateStatusDTO;
import com.nivra.nivra.service.IssueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public List<IssueResponseDTO> getAllIssues() {
        return issueService.getAllIssues();
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
    public void deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
    }
}