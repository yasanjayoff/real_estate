package com.realestate.dto;

import com.realestate.enums.NewsEventType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsEventDto {

    private Long id;

    private String title;

    private String content;

    private NewsEventType type;

    private String imageUrl;

    private LocalDateTime eventDate;

    private String location;

    private String summary;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
