package com.nivra.nivra.dto;

import com.nivra.nivra.entity.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusDTO {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }
}