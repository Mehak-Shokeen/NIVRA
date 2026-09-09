package com.nivra.nivra.service;

import com.nivra.nivra.dto.CommentRequestDTO;
import com.nivra.nivra.dto.CommentResponseDTO;
import com.nivra.nivra.entity.Comment;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.CommentRepository;
import com.nivra.nivra.repository.IssueRepository;
import com.nivra.nivra.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            IssueRepository issueRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    public CommentResponseDTO addComment(
            Long issueId,
            String email,
            CommentRequestDTO request) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue not found with id: " + issueId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        Comment comment = new Comment();

        comment.setText(request.getText());
        comment.setIssue(issue);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        return convertToResponseDTO(savedComment);
    }

    public List<CommentResponseDTO> getComments(Long issueId) {

        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(
                    "Issue not found with id: " + issueId);
        }

        return commentRepository
                .findByIssueIdOrderByCreatedAtAsc(issueId)
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    private CommentResponseDTO convertToResponseDTO(
            Comment comment) {

        return new CommentResponseDTO(
                comment.getId(),
                comment.getText(),
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getCreatedAt()
        );
    }
}
