package com.nivra.nivra.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nivra.nivra.dto.AdminSummaryResponseDTO;
import com.nivra.nivra.dto.AdminUserResponseDTO;
import com.nivra.nivra.dto.UpdateUserRoleDTO;
import com.nivra.nivra.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/summary")
    public AdminSummaryResponseDTO getSummary(Authentication authentication) {
        requireAdmin(authentication);
        return adminService.getSummary();
    }

    @GetMapping("/users")
    public List<AdminUserResponseDTO> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            Authentication authentication) {

        requireAdmin(authentication);
        return adminService.getUsers(search, role);
    }

    @PatchMapping("/users/{id}/role")
    public AdminUserResponseDTO updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleDTO request,
            Authentication authentication) {

        requireAdmin(authentication);
        return adminService.updateRole(id, request.getRole(), authentication.getName());
    }

    private void requireAdmin(Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!admin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only administrators can access this resource");
        }
    }
}
