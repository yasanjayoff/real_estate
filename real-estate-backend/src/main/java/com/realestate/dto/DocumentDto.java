package com.realestate.dto;

import com.realestate.enums.DocumentStatus;
import com.realestate.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DocumentDto {

    @Data
    public static class Request {
        @NotBlank
        private String title;

        @NotNull
        private DocumentType documentType;

        @NotNull
        private Long propertyId;

        private Long dealId;
        private Long uploadedById;
        private DocumentStatus status;
        private LocalDate expiryDate;
        private String notes;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private DocumentType documentType;

        // Full nested property object (used by admin table)
        private PropertyDto.Response property;

        // Convenience fields — property id and title without full nesting
        private Long propertyId;
        private String propertyTitle;

        private DealDto.Response deal;
        private UserDto.Response uploadedBy;

        private String filePath;
        private String fileName;
        private String fileType;
        private Long fileSize;

        private DocumentStatus status;
        private LocalDate expiryDate;
        private String notes;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
