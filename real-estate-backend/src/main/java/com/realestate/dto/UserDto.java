package com.realestate.dto;

import com.realestate.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class UserDto {

    @Data
    public static class Request {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank @Email private String email;
        private String password;
        @NotBlank private String phone;
        @NotNull private Role role;
        private boolean active = true;
    }

    @Data
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private Role role;
        private boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    /** Used by logged-in users to update their own profile. Role cannot be changed. */
    @Data
    public static class ProfileUpdateRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank @Email private String email;
        @NotBlank private String phone;
        private String currentPassword;   // required if changing password
        private String newPassword;        // optional — blank = keep current
    }
}
