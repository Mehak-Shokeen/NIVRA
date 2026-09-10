package com.nivra.nivra.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class IssueRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(
        max = 100,
        message = "Title must not exceed 100 characters"
    )
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String status;

    private String priority;

    @DecimalMin(
        value = "-90.0",
        message = "Latitude must be between -90 and 90"
    )
    @DecimalMax(
        value = "90.0",
        message = "Latitude must be between -90 and 90"
    )
    private Double latitude;

    @DecimalMin(
        value = "-180.0",
        message = "Longitude must be between -180 and 180"
    )
    @DecimalMax(
        value = "180.0",
        message = "Longitude must be between -180 and 180"
    )
    private Double longitude;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
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
}