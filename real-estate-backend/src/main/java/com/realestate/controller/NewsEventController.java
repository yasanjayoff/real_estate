package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.NewsEventDto;
import com.realestate.enums.NewsEventType;
import com.realestate.service.NewsEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news-events")
@RequiredArgsConstructor
public class NewsEventController {

    private final NewsEventService newsEventService;

    @GetMapping
    public ResponseEntity<List<NewsEventDto>> getAll(
            @RequestParam(required = false) NewsEventType type) {
        List<NewsEventDto> result = (type != null)
                ? newsEventService.getByType(type)
                : newsEventService.getAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsEventDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(newsEventService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsEventDto>> create(@RequestBody NewsEventDto dto) {
        NewsEventDto created = newsEventService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true,
                        "News/Event created and email notifications sent", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NewsEventDto>> update(
            @PathVariable Long id, @RequestBody NewsEventDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                "News/Event updated successfully", newsEventService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        newsEventService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true,
                "News/Event deleted successfully", null));
    }
}