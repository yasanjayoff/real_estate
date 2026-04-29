package com.realestate.dto;

import com.realestate.enums.DealStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DealDto {

    @Data
    public static class Request {
        @NotNull private Long propertyId;
        @NotNull private Long buyerId;
        private Long sellerId;   // optional — buyer inquiries may not have a seller yet
        private Long agentId;
        @NotNull private BigDecimal offerPrice;
        private DealStatus status;
        private String notes;
        private LocalDate closedDate;
    }

    @Data
    public static class ReplyRequest {
        @NotBlank
        private String replyText;
        private DealStatus status;
    }

    @Data
    public static class Response {
        private Long id;
        private PropertyDto.Response property;
        private UserDto.Response buyer;
        private UserDto.Response seller;
        private UserDto.Response agent;
        private BigDecimal offerPrice;
        private DealStatus status;
        private String notes;
        private String adminReply;
        private java.time.LocalDateTime repliedAt;
        private LocalDate closedDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
