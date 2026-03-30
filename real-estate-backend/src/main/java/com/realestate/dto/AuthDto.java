package com.realestate.dto;

import com.realestate.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String phone;
        // role is always BUYER on registration — not accepted from client
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long userId;
        private String email;
        private String firstName;
        private String lastName;
        private Role role;

        public AuthResponse(String token, Long userId, String email,
                            String firstName, String lastName, Role role) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
        }
    }
}
