package com.nivra.nivra.dto;

public class AdminSummaryResponseDTO {

    private long totalUsers;
    private long citizens;
    private long workers;
    private long authorities;
    private long admins;
    private long totalIssues;
    private long newIssues;
    private long activeIssues;
    private long resolvedIssues;

    public AdminSummaryResponseDTO(
            long totalUsers,
            long citizens,
            long workers,
            long authorities,
            long admins,
            long totalIssues,
            long newIssues,
            long activeIssues,
            long resolvedIssues) {
        this.totalUsers = totalUsers;
        this.citizens = citizens;
        this.workers = workers;
        this.authorities = authorities;
        this.admins = admins;
        this.totalIssues = totalIssues;
        this.newIssues = newIssues;
        this.activeIssues = activeIssues;
        this.resolvedIssues = resolvedIssues;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getCitizens() { return citizens; }
    public long getWorkers() { return workers; }
    public long getAuthorities() { return authorities; }
    public long getAdmins() { return admins; }
    public long getTotalIssues() { return totalIssues; }
    public long getNewIssues() { return newIssues; }
    public long getActiveIssues() { return activeIssues; }
    public long getResolvedIssues() { return resolvedIssues; }
}
