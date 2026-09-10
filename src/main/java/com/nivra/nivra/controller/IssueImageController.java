package com.nivra.nivra.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nivra.nivra.dto.ImageUploadResponseDTO;
import com.nivra.nivra.service.ImageUploadService;

@RestController
@RequestMapping("/api/issues")
public class IssueImageController {

    private final ImageUploadService imageUploadService;

    public IssueImageController(
            ImageUploadService imageUploadService) {

        this.imageUploadService =
                imageUploadService;
    }

    @PostMapping(
            value = "/{issueId}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ImageUploadResponseDTO uploadImage(
            @PathVariable Long issueId,
            @RequestParam("file") MultipartFile file) {

        return imageUploadService.uploadIssueImage(
                issueId,
                file
        );
    }
}
