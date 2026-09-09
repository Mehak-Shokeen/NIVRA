package com.nivra.nivra.repository;

import com.nivra.nivra.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}