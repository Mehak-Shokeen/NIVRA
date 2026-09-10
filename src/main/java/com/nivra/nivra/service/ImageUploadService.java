package com.nivra.nivra.service;

import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nivra.nivra.dto.ImageUploadResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.IssueRepository;

@Service
public class ImageUploadService {

    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024;

    private final Cloudinary cloudinary;
    private final IssueRepository issueRepository;

    public ImageUploadService(
            Cloudinary cloudinary,
            IssueRepository issueRepository) {

        this.cloudinary = cloudinary;
        this.issueRepository = issueRepository;
    }

    @CacheEvict(value = "issues", allEntries = true)
    public ImageUploadResponseDTO uploadIssueImage(
            Long issueId,
            MultipartFile file) {

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Issue not found with id: "
                                                + issueId
                                )
                        );

        validateImage(file);

        try {

            Map<String, Object> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    "nivra/issues",
                                    "resource_type",
                                    "image"
                            )
                    );

            String secureUrl =
                    (String) uploadResult.get("secure_url");

            issue.setImageUrl(secureUrl);

            issueRepository.save(issue);

            return new ImageUploadResponseDTO(
                    issue.getId(),
                    secureUrl
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Image upload failed",
                    e
            );
        }
    }

    private void validateImage(
            MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file is required"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image must not exceed 5 MB"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }
    }
}
