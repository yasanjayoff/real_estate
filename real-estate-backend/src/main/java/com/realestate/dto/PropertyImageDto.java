package com.realestate.dto;

import lombok.Data;

import java.time.LocalDateTime;

public class PropertyImageDto {

    @Data
    public static class Response {
        private Long id;
        private Long propertyId;
        private String imageData;   // full Base64 data URI
        private String fileName;
        private String contentType;
        private Integer sortOrder;
        private LocalDateTime createdAt;
    }

    @Data
    public static class UploadRequest {
        // imageData: Base64 data URI sent from frontend
        private String imageData;
        private String fileName;
        private String contentType;
        private Integer sortOrder;
    }
}
