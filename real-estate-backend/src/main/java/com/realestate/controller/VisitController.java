package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.VisitDto;
import com.realestate.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<VisitDto.Response>>> getAllVisits() {
        return ResponseEntity.ok(ApiResponse.success(visitService.getAllVisits()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<VisitDto.Response>>> getUpcomingVisits() {
        return ResponseEntity.ok(ApiResponse.success(visitService.getUpcomingVisits()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VisitDto.Response>> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(visitService.getVisitById(id)));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<ApiResponse<List<VisitDto.Response>>> getVisitsByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(ApiResponse.success(visitService.getVisitsByBuyer(buyerId)));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<VisitDto.Response>>> getVisitsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(visitService.getVisitsByProperty(propertyId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VisitDto.Response>> createVisit(
            @Valid @RequestBody VisitDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Visit scheduled", visitService.createVisit(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VisitDto.Response>> updateVisit(
            @PathVariable Long id, @Valid @RequestBody VisitDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Visit updated", visitService.updateVisit(id, request)));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VisitDto.Response>> approveVisit(
            @PathVariable Long id,
            @RequestBody(required = false) VisitDto.ApproveRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Visit approved", visitService.approveVisit(id, request)));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VisitDto.Response>> rejectVisit(
            @PathVariable Long id,
            @RequestBody(required = false) VisitDto.ApproveRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Visit rejected", visitService.rejectVisit(id, request)));
    }

        @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVisit(@PathVariable Long id) {
        visitService.deleteVisit(id);
        return ResponseEntity.ok(ApiResponse.success("Visit deleted", null));
    }
}
