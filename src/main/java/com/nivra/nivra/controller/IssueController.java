package com.nivra.nivra.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
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
    public IssueResponseDTO getIssueById(@PathVariable Long id) {
        return issueService.getIssueById(id);
    }

    @PostMapping
    public IssueResponseDTO createIssue(@Valid @RequestBody IssueRequestDTO request) {
        return issueService.createIssue(request);
    }

    @PutMapping("/{id}")
    public IssueResponseDTO updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequestDTO request) {

        return issueService.updateIssue(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
    }
}
