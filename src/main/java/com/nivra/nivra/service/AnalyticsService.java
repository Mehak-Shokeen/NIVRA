package com.nivra.nivra.service;

import com.nivra.nivra.dto.AnalyticsItemDTO;
import com.nivra.nivra.dto.AnalyticsResponseDTO;
import com.nivra.nivra.dto.HotspotDTO;
import com.nivra.nivra.dto.WorkerAnalyticsDTO;
import com.nivra.nivra.repository.AnalyticsRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public AnalyticsResponseDTO getAnalytics() {

        long total = analyticsRepository.countTotalIssues();
        long newIssues = analyticsRepository.countNewIssues();
        long active = analyticsRepository.countActiveIssues();
        long resolved = analyticsRepository.countResolvedIssues();
        long unassigned = analyticsRepository.countUnassignedIssues();

        double resolutionRate = total == 0
                ? 0.0
                : (resolved * 100.0) / total;

        return new AnalyticsResponseDTO(
                total,
                newIssues,
                active,
                resolved,
                unassigned,
                round(resolutionRate),
                analyticsRepository.averageResolutionHours() == null
                        ? null
                        : round(analyticsRepository.averageResolutionHours()),
                mapItems(analyticsRepository.countByCategory()),
                mapItems(analyticsRepository.countByStatus()),
                mapItems(analyticsRepository.countByPriority()),
                mapItems(analyticsRepository.activityTrend()),
                mapWorkers(analyticsRepository.workerWorkload()),
                mapHotspots(analyticsRepository.hotspots())
        );
    }

    private List<AnalyticsItemDTO> mapItems(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new AnalyticsItemDTO(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    private List<WorkerAnalyticsDTO> mapWorkers(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new WorkerAnalyticsDTO(
                        ((Number) row[0]).longValue(),
                        String.valueOf(row[1]),
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue(),
                        ((Number) row[4]).longValue()
                ))
                .toList();
    }

    private List<HotspotDTO> mapHotspots(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new HotspotDTO(
                        ((Number) row[0]).doubleValue(),
                        ((Number) row[1]).doubleValue(),
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
