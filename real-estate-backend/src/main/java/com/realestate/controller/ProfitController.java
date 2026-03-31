package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.ProfitDto;
import com.realestate.service.ProfitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profits")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ProfitController {

    private final ProfitService profitService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfitDto.Response>>> getAllProfits() {
        return ResponseEntity.ok(ApiResponse.success(profitService.getAllProfits()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ProfitDto.Summary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(profitService.getSummary()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfitDto.Response>> getProfitById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(profitService.getProfitById(id)));
    }

    @GetMapping("/deal/{dealId}")
    public ResponseEntity<ApiResponse<ProfitDto.Response>> getProfitByDeal(@PathVariable Long dealId) {
        return ResponseEntity.ok(ApiResponse.success(profitService.getProfitByDeal(dealId)));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<ProfitDto.Response>>> getProfitsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(profitService.getProfitsByProperty(propertyId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfitDto.Response>> createProfit(
            @Valid @RequestBody ProfitDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profit record created", profitService.createProfit(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfitDto.Response>> updateProfit(
            @PathVariable Long id, @Valid @RequestBody ProfitDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Profit updated", profitService.updateProfit(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfit(@PathVariable Long id) {
        profitService.deleteProfit(id);
        return ResponseEntity.ok(ApiResponse.success("Profit record deleted", null));
    }
}
