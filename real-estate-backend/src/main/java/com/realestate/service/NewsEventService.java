package com.realestate.service;

import com.realestate.dto.NewsEventDto;
import com.realestate.entity.NewsEvent;
import com.realestate.entity.User;
import com.realestate.enums.NewsEventType;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.NewsEventRepository;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsEventService {

    private final NewsEventRepository newsEventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ────────────────── Public Read ──────────────────

    public List<NewsEventDto> getAll() {
        return newsEventRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<NewsEventDto> getByType(NewsEventType type) {
        return newsEventRepository.findByTypeOrderByCreatedAtDesc(type)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public NewsEventDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    // ────────────────── Admin CRUD ──────────────────

    @Transactional
    public NewsEventDto create(NewsEventDto dto) {
        NewsEvent entity = NewsEvent.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .type(dto.getType())
                .imageUrl(resolveImageUrl(dto.getImageUrl()))
                .eventDate(dto.getEventDate())
                .location(dto.getLocation())
                .summary(dto.getSummary())
                .build();

        NewsEvent saved = newsEventRepository.save(entity);
        log.info("Created NewsEvent id={} type={}", saved.getId(), saved.getType());

        List<User> activeUsers = userRepository.findAll()
                .stream().filter(User::isActive).collect(Collectors.toList());

        if (!activeUsers.isEmpty()) {
            emailService.sendNewsEventNotification(saved, activeUsers);
            log.info("Email notification queued for {} users", activeUsers.size());
        }

        return toDto(saved);
    }

    @Transactional
    public NewsEventDto update(Long id, NewsEventDto dto) {
        NewsEvent entity = findOrThrow(id);
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setType(dto.getType());
        entity.setImageUrl(resolveImageUrl(dto.getImageUrl()));
        entity.setEventDate(dto.getEventDate());
        entity.setLocation(dto.getLocation());
        entity.setSummary(dto.getSummary());
        return toDto(newsEventRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        newsEventRepository.delete(findOrThrow(id));
        log.info("Deleted NewsEvent id={}", id);
    }

    // ────────────────── Helpers ──────────────────

    /**
     * Accepts both plain URLs and base64 data URLs (data:image/...).
     * Returns null for blank/null input.
     */
    private String resolveImageUrl(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return raw.trim();
    }

    private NewsEvent findOrThrow(Long id) {
        return newsEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NewsEvent not found: " + id));
    }

    private NewsEventDto toDto(NewsEvent e) {
        return NewsEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .content(e.getContent())
                .type(e.getType())
                .imageUrl(e.getImageUrl())
                .eventDate(e.getEventDate())
                .location(e.getLocation())
                .summary(e.getSummary())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}