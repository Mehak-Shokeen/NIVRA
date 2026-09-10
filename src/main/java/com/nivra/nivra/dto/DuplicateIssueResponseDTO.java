package com.nivra.nivra.dto;

public class DuplicateIssueResponseDTO {

    private boolean duplicateFound;
    private Long issueId;
    private String title;
    private String category;
    private String status;
    private Double distanceMeters;

    public DuplicateIssueResponseDTO(
            boolean duplicateFound,
            Long issueId,
            String title,
            String category,
            String status,
            Double distanceMeters) {

        this.duplicateFound = duplicateFound;
        this.issueId = issueId;
        this.title = title;
        this.category = category;
        this.status = status;
        this.distanceMeters = distanceMeters;
    }

    public boolean isDuplicateFound() {
        return duplicateFound;
    }

    public Long getIssueId() {
        return issueId;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }
}