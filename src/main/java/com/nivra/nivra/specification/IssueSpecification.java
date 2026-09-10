package com.nivra.nivra.specification;

import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.IssueStatus;

import org.springframework.data.jpa.domain.Specification;

public class IssueSpecification {

    public static Specification<Issue> hasStatus(
            IssueStatus status) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("status"),
                        status
                );
    }

    public static Specification<Issue> hasCategory(
            String category) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                root.get("category")
                        ),
                        category.toLowerCase()
                );
    }

    public static Specification<Issue> hasPriority(
            String priority) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                root.get("priority")
                        ),
                        priority.toLowerCase()
                );
    }

    public static Specification<Issue> containsText(
            String search) {

        return (root, query, criteriaBuilder) -> {

            String pattern =
                    "%" + search.toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("title")
                            ),
                            pattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("description")
                            ),
                            pattern
                    )
            );
        };
    }
}
