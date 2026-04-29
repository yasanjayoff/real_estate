package com.realestate.dto;

import com.realestate.enums.VisitStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class VisitDto {

    @Data
    public static class Request {
        @NotNull private Long propertyId;
        @NotNull private Long buyerId;
        private Long agentId;
        @NotNull private LocalDate visitDate;
        @NotNull private LocalTime visitTime;
        private VisitStatus status;
        private String notes;
    }

    @Data
    public static class Response {
        private Long id;
        private PropertyDto.Response property;
        private UserDto.Response buyer;
        private UserDto.Response agent;
        private LocalDate visitDate;
        private LocalTime visitTime;
        private VisitStatus status;
        private String notes;
        private String adminNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class ApproveRejectRequest {
        private String adminNote;
    }
}
