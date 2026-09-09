package com.nivra.nivra.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_status_history")
public class IssueStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Enumerated(EnumType.STRING)
    private IssueStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private IssueStatus newStatus;

    private String changedBy;

    private LocalDateTime changedAt;

    public IssueStatusHistory() {}

    public Long getId() {
        return id;
    }

    public Issue getIssue() {
        return issue;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public IssueStatus getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(IssueStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public IssueStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(IssueStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}