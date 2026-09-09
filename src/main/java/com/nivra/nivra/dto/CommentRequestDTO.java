package com.nivra.nivra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequestDTO {

    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}