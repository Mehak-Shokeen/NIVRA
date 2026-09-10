package com.nivra.nivra.dto;

import java.util.List;

public class CachedIssueResponseDTO {

    private List<IssueResponseDTO> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;

    public CachedIssueResponseDTO() {
    }

    public CachedIssueResponseDTO(
            List<IssueResponseDTO> content,
            int pageNumber,
            int pageSize,
            long totalElements) {

        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
    }

    public List<IssueResponseDTO> getContent() {
        return content;
    }

    public void setContent(List<IssueResponseDTO> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }
}
