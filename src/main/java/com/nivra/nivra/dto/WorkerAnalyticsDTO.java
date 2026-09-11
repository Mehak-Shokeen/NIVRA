package com.nivra.nivra.dto;

public record WorkerAnalyticsDTO(
        Long id,
        String name,
        long totalAssigned,
        long active,
        long resolved
) {
}
