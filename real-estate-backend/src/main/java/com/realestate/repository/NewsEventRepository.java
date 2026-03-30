package com.realestate.repository;

import com.realestate.entity.NewsEvent;
import com.realestate.enums.NewsEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsEventRepository extends JpaRepository<NewsEvent, Long> {

    List<NewsEvent> findByTypeOrderByCreatedAtDesc(NewsEventType type);

    List<NewsEvent> findAllByOrderByCreatedAtDesc();
}
