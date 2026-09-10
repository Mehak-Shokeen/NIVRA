package com.nivra.nivra.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.CachedIssueResponseDTO;
import com.nivra.nivra.dto.IssueResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.IssueStatus;
import com.nivra.nivra.repository.IssueRepository;
import com.nivra.nivra.specification.IssueSpecification;

@Service
public class IssueCacheService {

    private final IssueRepository issueRepository;

    public IssueCacheService(
            IssueRepository issueRepository) {

        this.issueRepository = issueRepository;
    }

    @Cacheable(
        value = "issues",
        key = "#search + '-' + #status + '-' + #category + '-' + #priority + '-' + #pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort"
    )
    public CachedIssueResponseDTO getCachedIssues(
            String search,
            IssueStatus status,
            String category,
            String priority,
            Pageable pageable) {

        Specification<Issue> specification =
                (root, query, criteriaBuilder) -> null;

        if (search != null && !search.isBlank()) {
            specification = specification.and(
                    IssueSpecification.containsText(search)
            );
        }

        if (status != null) {
            specification = specification.and(
                    IssueSpecification.hasStatus(status)
            );
        }

        if (category != null && !category.isBlank()) {
            specification = specification.and(
                    IssueSpecification.hasCategory(category)
            );
        }

        if (priority != null && !priority.isBlank()) {
            specification = specification.and(
                    IssueSpecification.hasPriority(priority)
            );
        }

        Page<IssueResponseDTO> page =
                issueRepository.findAll(
                        specification,
                        pageable
                ).map(this::convertToResponseDTO);

        return new CachedIssueResponseDTO(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }

    private IssueResponseDTO convertToResponseDTO(
            Issue issue) {

        Long assignedWorkerId = null;

        if (issue.getAssignedTo() != null) {
            assignedWorkerId =
                    issue.getAssignedTo().getId();
        }

        Double latitude = null;
        Double longitude = null;

        if (issue.getLocation() != null) {
            latitude =
                    issue.getLocation().getY();

            longitude =
                    issue.getLocation().getX();
        }

        return new IssueResponseDTO(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getCategory(),
                issue.getStatus(),
                issue.getPriority(),
                assignedWorkerId,
                latitude,
                longitude,
                issue.getImageUrl()
        );
    }
}
