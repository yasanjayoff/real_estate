package com.realestate.dto;

import com.realestate.enums.PropertyStatus;
import com.realestate.enums.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PropertyDto {

    @Data
    public static class Request {
        @NotBlank private String title;
        private String description;
        @NotNull private PropertyType propertyType;
        @NotBlank private String address;
        @NotBlank private String city;
        private String district;
        @NotNull private BigDecimal price;       // base/starting price
        private Double sizeInSqft;               // total site area
        private PropertyStatus status;
        @NotNull private Long ownerId;

        // LAND fields
        private Integer totalBlocks;
        private BigDecimal pricePerBlock;

        // APARTMENT fields
        private Integer totalFloors;
        private Integer unitsPerFloor;
        private BigDecimal pricePerUnit;
        private Integer yearBuilt;
        private Boolean hasParking;
        private Boolean hasGym;
        private Boolean hasPool;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private PropertyType propertyType;
        private String address;
        private String city;
        private String district;
        private BigDecimal price;
        private Double sizeInSqft;
        private PropertyStatus status;
        private UserDto.Response owner;

        // LAND
        private Integer totalBlocks;
        private BigDecimal pricePerBlock;
        // slot summary (computed)
        private Long availableBlocks;
        private Long bookedBlocks;

        // APARTMENT
        private Integer totalFloors;
        private Integer unitsPerFloor;
        private BigDecimal pricePerUnit;
        private Integer yearBuilt;
        private Boolean hasParking;
        private Boolean hasGym;
        private Boolean hasPool;
        // slot summary (computed)
        private Long availableUnits;
        private Long bookedUnits;
        private Long totalUnits;

        private List<PropertyImageDto.Response> images;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
