package com.nivra.nivra.repository;

import com.nivra.nivra.entity.IssueStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueStatusHistoryRepository
        extends JpaRepository<IssueStatusHistory, Long> {
}
