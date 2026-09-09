package com.nivra.nivra.dto;

import com.nivra.nivra.entity.IssueStatus;

public class IssueResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private IssueStatus status;
    private String priority;
    private Long assignedTo;

    public IssueResponseDTO(
            Long id,
            String title,
            String description,
            String category,
            IssueStatus status,
            String priority,
            Long assignedTo) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.assignedTo = assignedTo;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }
}