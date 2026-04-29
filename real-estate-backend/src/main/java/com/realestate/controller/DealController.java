package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.DealDto;
import com.realestate.enums.DealStatus;
import com.realestate.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    // Admin sees all deals
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DealDto.Response>>> getAllDeals(
            @RequestParam(required = false) DealStatus status) {
        if (status != null) {
            return ResponseEntity.ok(ApiResponse.success(dealService.getDealsByStatus(status)));
        }
        return ResponseEntity.ok(ApiResponse.success(dealService.getAllDeals()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealDto.Response>> getDealById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dealService.getDealById(id)));
    }

    // Buyer fetches their own deals — used by buyer in PropertyDetailView
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<ApiResponse<List<DealDto.Response>>> getDealsByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(ApiResponse.success(dealService.getDealsByBuyer(buyerId)));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<DealDto.Response>>> getDealsBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(ApiResponse.success(dealService.getDealsBySeller(sellerId)));
    }

    // Get deals for a specific property (admin + buyer can see)
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<DealDto.Response>>> getDealsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(dealService.getDealsByProperty(propertyId)));
    }

    // Buyers can create their own inquiries, admin can create any deal
    @PostMapping
    public ResponseEntity<ApiResponse<DealDto.Response>> createDeal(
            @Valid @RequestBody DealDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inquiry submitted successfully", dealService.createDeal(request)));
    }

    // Admin only — full deal update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DealDto.Response>> updateDeal(
            @PathVariable Long id, @Valid @RequestBody DealDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Deal updated", dealService.updateDeal(id, request)));
    }

    // Admin only — post a reply and optionally change status
    @PatchMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DealDto.Response>> replyToDeal(
            @PathVariable Long id,
            @Valid @RequestBody DealDto.ReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reply sent", dealService.replyToDeal(id, request)));
    }

    // Buyers can delete their own CANCELLED/NEW deals; Admin can delete any
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDeal(@PathVariable Long id) {
        dealService.deleteDeal(id);
        return ResponseEntity.ok(ApiResponse.success("Deal removed", null));
    }
}
