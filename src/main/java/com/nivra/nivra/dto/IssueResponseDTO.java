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
    private Double latitude;
    private Double longitude;
    private String imageUrl;

    public IssueResponseDTO() {
    }

    public IssueResponseDTO(
            Long id,
            String title,
            String description,
            String category,
            IssueStatus status,
            String priority,
            Long assignedTo,
            Double latitude,
            Double longitude) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.assignedTo = assignedTo;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public IssueResponseDTO(
            Long id,
            String title,
            String description,
            String category,
            IssueStatus status,
            String priority,
            Long assignedTo,
            Double latitude,
            Double longitude,
            String imageUrl) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.assignedTo = assignedTo;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}