package com.nivra.nivra.dto;

import java.util.List;

public record AnalyticsResponseDTO(
        long totalIssues,
        long newIssues,
        long activeIssues,
        long resolvedIssues,
        long unassignedIssues,
        double resolutionRate,
        Double averageResolutionHours,
        List<AnalyticsItemDTO> byCategory,
        List<AnalyticsItemDTO> byStatus,
        List<AnalyticsItemDTO> byPriority,
        List<AnalyticsItemDTO> activityTrend,
        List<WorkerAnalyticsDTO> workerWorkload,
        List<HotspotDTO> hotspots
) {
}
