package com.nivra.nivra.service;

import java.util.List;
import java.util.Locale;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivra.nivra.dto.AdminSummaryResponseDTO;
import com.nivra.nivra.dto.AdminUserResponseDTO;
import com.nivra.nivra.entity.IssueStatus;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.repository.IssueRepository;
import com.nivra.nivra.repository.UserRepository;

@Service
public class AdminService {

    private static final List<String> VALID_ROLES =
            List.of("CITIZEN", "WORKER", "AUTHORITY", "ADMIN");

    private final UserRepository userRepository;
    private final IssueRepository issueRepository;

    public AdminService(UserRepository userRepository, IssueRepository issueRepository) {
        this.userRepository = userRepository;
        this.issueRepository = issueRepository;
    }

    public List<AdminUserResponseDTO> getUsers(String search, String role) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        String normalizedRole = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);

        return userRepository.findAll().stream()
                .filter(user -> normalizedSearch.isBlank()
                        || user.getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedSearch))
                .filter(user -> normalizedRole.isBlank() || normalizedRole.equals(user.getRole()))
                .map(user -> new AdminUserResponseDTO(
                        user.getId(), user.getName(), user.getEmail(), user.getRole()))
                .toList();
    }

    @Transactional
    public AdminUserResponseDTO updateRole(Long userId, String newRole, String adminEmail) {
        String role = newRole == null ? "" : newRole.trim().toUpperCase(Locale.ROOT);

        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException(
                    "Invalid role. Use CITIZEN, WORKER, AUTHORITY or ADMIN.");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new AccessDeniedException("Administrator not found"));

        if (!"ADMIN".equals(admin.getRole())) {
            throw new AccessDeniedException("Only administrators can change user roles");
        }

        if (admin.getId().equals(userId) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("You cannot remove your own administrator role");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setRole(role);
        User saved = userRepository.save(user);

        return new AdminUserResponseDTO(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AdminSummaryResponseDTO getSummary() {
        long totalIssues = issueRepository.count();
        long newIssues = issueRepository.countByStatus(IssueStatus.NEW);
        long resolvedIssues = issueRepository.countByStatus(IssueStatus.RESOLVED);
        long activeIssues = totalIssues - newIssues - resolvedIssues;

        return new AdminSummaryResponseDTO(
                userRepository.count(),
                userRepository.countByRole("CITIZEN"),
                userRepository.countByRole("WORKER"),
                userRepository.countByRole("AUTHORITY"),
                userRepository.countByRole("ADMIN"),
                totalIssues,
                newIssues,
                Math.max(activeIssues, 0),
                resolvedIssues);
    }
}
