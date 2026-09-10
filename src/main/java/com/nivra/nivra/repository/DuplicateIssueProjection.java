package com.nivra.nivra.repository;

public interface DuplicateIssueProjection {

    Long getId();

    String getTitle();

    String getCategory();

    String getStatus();

    Double getDistanceMeters();
}
