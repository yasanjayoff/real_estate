package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.PropertyImageDto;
import com.realestate.service.PropertyImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}/images")
@RequiredArgsConstructor
public class PropertyImageController {

    private final PropertyImageService imageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyImageDto.Response>>> getImages(
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(imageService.getImagesByProperty(propertyId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<PropertyImageDto.Response>> addImage(
            @PathVariable Long propertyId,
            @RequestBody PropertyImageDto.UploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded successfully",
                        imageService.addImage(propertyId, request)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<List<PropertyImageDto.Response>>> replaceImages(
            @PathVariable Long propertyId,
            @RequestBody List<PropertyImageDto.UploadRequest> requests) {
        return ResponseEntity.ok(ApiResponse.success("Images updated",
                imageService.replaceImages(propertyId, requests)));
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long propertyId,
            @PathVariable Long imageId) {
        imageService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted", null));
    }
}
