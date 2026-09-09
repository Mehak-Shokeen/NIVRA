package com.nivra.nivra.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.IssueRequestDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.IssueRepository;

@Service
public class IssueService {

    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
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
                    new ResourceNotFoundException("Issue not found with id: " + id));
        return convertToResponseDTO(issue);
    }

    public IssueResponseDTO createIssue(IssueRequestDTO request) {
        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setStatus(request.getStatus());
        issue.setPriority(request.getPriority());

        Issue savedIssue = issueRepository.save(issue);

        return convertToResponseDTO(savedIssue);
    }

    public IssueResponseDTO updateIssue(Long id, IssueRequestDTO request) {
        Issue existingIssue = issueRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Issue not found with id: " + id));

        existingIssue.setTitle(request.getTitle());
        existingIssue.setDescription(request.getDescription());
        existingIssue.setCategory(request.getCategory());
        existingIssue.setStatus(request.getStatus());
        existingIssue.setPriority(request.getPriority());

        Issue updatedIssue = issueRepository.save(existingIssue);

        return convertToResponseDTO(updatedIssue);
    }
    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }

    private IssueResponseDTO convertToResponseDTO(Issue issue) {
        return new IssueResponseDTO(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getCategory(),
                issue.getStatus(),
                issue.getPriority()
        );
    }
}