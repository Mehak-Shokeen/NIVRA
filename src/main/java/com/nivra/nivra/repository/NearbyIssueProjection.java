package com.nivra.nivra.repository;

public interface NearbyIssueProjection {

    Long getId();

    String getTitle();

    String getDescription();

    String getCategory();

    String getStatus();

    String getPriority();

    Long getAssignedTo();

    Double getLatitude();

    Double getLongitude();

    Double getDistanceMeters();
}
