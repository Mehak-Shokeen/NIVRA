package com.nivra.nivra.dto;

public class NearbyIssueResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;
    private Long assignedTo;
    private Double latitude;
    private Double longitude;
    private Double distanceMeters;

    public NearbyIssueResponseDTO(
            Long id,
            String title,
            String description,
            String category,
            String status,
            String priority,
            Long assignedTo,
            Double latitude,
            Double longitude,
            Double distanceMeters) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.assignedTo = assignedTo;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceMeters = distanceMeters;
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

    public Long getAssignedTo() {
        return assignedTo;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }
}