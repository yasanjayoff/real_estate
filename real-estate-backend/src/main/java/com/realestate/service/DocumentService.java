package com.realestate.service;

import com.realestate.dto.DocumentDto;
import com.realestate.entity.Deal;
import com.realestate.entity.Document;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.enums.DocumentStatus;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.DealRepository;
import com.realestate.repository.DocumentRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PropertyRepository propertyRepository;
    private final DealRepository dealRepository;
    private final UserRepository userRepository;
    private final PropertyService propertyService;
    private final DealService dealService;
    private final UserService userService;

    private static final String UPLOAD_DIR = "./uploads/documents/";

    // ── Queries ──────────────────────────────────────────────────────────────

    public List<DocumentDto.Response> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DocumentDto.Response getDocumentById(Long id) {
        return toResponse(findById(id));
    }

    /**
     * Used by the download endpoint — returns only file metadata without
     * going through any role-restricted method, so BUYER can download.
     */
    public Document getDocumentEntityById(Long id) {
        return findById(id);
    }

    public List<DocumentDto.Response> getDocumentsByProperty(Long propertyId) {
        return documentRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DocumentDto.Response> getDocumentsByDeal(Long dealId) {
        return documentRepository.findByDealId(dealId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    public DocumentDto.Response createDocument(DocumentDto.Request request, MultipartFile file) throws IOException {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));

        Document document = Document.builder()
                .title(request.getTitle())
                .documentType(request.getDocumentType())
                .property(property)
                .status(request.getStatus() != null ? request.getStatus() : DocumentStatus.PENDING)
                .expiryDate(request.getExpiryDate())
                .notes(request.getNotes())
                .build();

        if (request.getDealId() != null) {
            Deal deal = dealRepository.findById(request.getDealId())
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", request.getDealId()));
            document.setDeal(deal);
        }

        if (request.getUploadedById() != null) {
            User uploader = userRepository.findById(request.getUploadedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUploadedById()));
            document.setUploadedBy(uploader);
        }

        if (file != null && !file.isEmpty()) {
            String savedPath = saveFile(file);
            document.setFilePath(savedPath);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
        }

        return toResponse(documentRepository.save(document));
    }

    public DocumentDto.Response updateDocument(Long id, DocumentDto.Request request) {
        Document document = findById(id);
        document.setTitle(request.getTitle());
        document.setDocumentType(request.getDocumentType());
        if (request.getStatus() != null) document.setStatus(request.getStatus());
        document.setExpiryDate(request.getExpiryDate());
        document.setNotes(request.getNotes());

        // Allow property reassignment on update
        if (request.getPropertyId() != null) {
            Property property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));
            document.setProperty(property);
        }

        if (request.getDealId() != null) {
            Deal deal = dealRepository.findById(request.getDealId())
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", request.getDealId()));
            document.setDeal(deal);
        } else {
            document.setDeal(null);
        }

        return toResponse(documentRepository.save(document));
    }

    public void deleteDocument(Long id) {
        Document doc = findById(id);
        // Also delete physical file if present
        if (doc.getFilePath() != null) {
            try { Files.deleteIfExists(Paths.get(doc.getFilePath())); } catch (IOException ignored) {}
        }
        documentRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);
        return UPLOAD_DIR + uniqueFileName;
    }

    private Document findById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
    }

    public DocumentDto.Response toResponse(Document document) {
        DocumentDto.Response response = new DocumentDto.Response();
        response.setId(document.getId());
        response.setTitle(document.getTitle());
        response.setDocumentType(document.getDocumentType());
        response.setFilePath(document.getFilePath());
        response.setFileName(document.getFileName());
        response.setFileType(document.getFileType());
        response.setFileSize(document.getFileSize());
        response.setStatus(document.getStatus());
        response.setExpiryDate(document.getExpiryDate());
        response.setNotes(document.getNotes());
        response.setCreatedAt(document.getCreatedAt());
        response.setUpdatedAt(document.getUpdatedAt());

        if (document.getProperty() != null) {
            response.setProperty(propertyService.toResponse(document.getProperty()));
            response.setPropertyId(document.getProperty().getId());
            response.setPropertyTitle(document.getProperty().getTitle());
        }
        if (document.getDeal() != null) {
            response.setDeal(dealService.toResponse(document.getDeal()));
        }
        if (document.getUploadedBy() != null) {
            response.setUploadedBy(userService.toResponse(document.getUploadedBy()));
        }
        return response;
    }
}
