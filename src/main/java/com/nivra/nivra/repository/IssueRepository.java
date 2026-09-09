package com.nivra.nivra.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nivra.nivra.entity.Issue;

public interface IssueRepository extends JpaRepository<Issue, Long> {
}