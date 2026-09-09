package com.nivra.nivra.controller;

import com.nivra.nivra.dto.CommentRequestDTO;
import com.nivra.nivra.dto.CommentResponseDTO;
import com.nivra.nivra.service.CommentService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues/{issueId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public CommentResponseDTO addComment(
            @PathVariable Long issueId,
            @Valid @RequestBody CommentRequestDTO request,
            Authentication authentication) {

        return commentService.addComment(
                issueId,
                authentication.getName(),
                request
        );
    }

    @GetMapping
    public List<CommentResponseDTO> getComments(
            @PathVariable Long issueId) {

        return commentService.getComments(issueId);
    }
}