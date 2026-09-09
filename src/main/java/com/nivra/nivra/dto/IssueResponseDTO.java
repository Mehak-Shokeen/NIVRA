package com.nivra.nivra.dto;

public class IssueResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;

    public IssueResponseDTO(Long id, String title, String description,
                             String category, String status, String priority) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
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

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }
}
