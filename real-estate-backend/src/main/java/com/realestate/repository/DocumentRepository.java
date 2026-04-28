package com.realestate.repository;

import com.realestate.entity.Document;
import com.realestate.enums.DocumentStatus;
import com.realestate.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByPropertyId(Long propertyId);

    List<Document> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    List<Document> findByDealId(Long dealId);

    List<Document> findByStatus(DocumentStatus status);

    List<Document> findByDocumentType(DocumentType documentType);

    List<Document> findByUploadedById(Long userId);

    long countByPropertyId(Long propertyId);
}
