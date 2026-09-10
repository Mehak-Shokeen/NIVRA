package com.nivra.nivra.dto;

public class ImageUploadResponseDTO {

    private Long issueId;
    private String imageUrl;

    public ImageUploadResponseDTO() {
    }

    public ImageUploadResponseDTO(
            Long issueId,
            String imageUrl) {

        this.issueId = issueId;
        this.imageUrl = imageUrl;
    }

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
