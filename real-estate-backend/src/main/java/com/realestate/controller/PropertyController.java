package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.PropertyDto;
import com.realestate.enums.PropertyStatus;
import com.realestate.enums.PropertyType;
import com.realestate.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyDto.Response>>> getAllProperties(
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        if (status != null || type != null || city != null || minPrice != null || maxPrice != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    propertyService.getPropertiesWithFilters(status, type, city, minPrice, maxPrice)));
        }
        return ResponseEntity.ok(ApiResponse.success(propertyService.getAllProperties()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyDto.Response>> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getPropertyById(id)));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<PropertyDto.Response>>> getByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getPropertiesByOwner(ownerId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<PropertyDto.Response>> createProperty(
            @Valid @RequestBody PropertyDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Property created successfully", propertyService.createProperty(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<PropertyDto.Response>> updateProperty(
            @PathVariable Long id, @Valid @RequestBody PropertyDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Property updated", propertyService.updateProperty(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<PropertyDto.Response>> updateStatus(
            @PathVariable Long id, @RequestParam PropertyStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", propertyService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok(ApiResponse.success("Property deleted", null));
    }
}
