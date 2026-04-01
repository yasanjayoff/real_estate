package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.DocumentDto;
import com.realestate.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final ObjectMapper objectMapper;

    // ── Read endpoints ──────────────────────────────────────────────────────

    /**
     * Admin / Agent / Seller: list all documents
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<List<DocumentDto.Response>>> getAllDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getAllDocuments()));
    }

    /**
     * Admin / Agent / Seller: get single document by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SELLER')")
    public ResponseEntity<ApiResponse<DocumentDto.Response>> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getDocumentById(id)));
    }

    /**
     * ALL authenticated users (including BUYER) — fetch documents for a specific property.
     * This is the endpoint used by the buyer "View Documents" modal in PropertiesPage.
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<DocumentDto.Response>>> getByProperty(
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(
                ApiResponse.success(documentService.getDocumentsByProperty(propertyId)));
    }

    @GetMapping("/deal/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<DocumentDto.Response>>> getByDeal(
            @PathVariable Long dealId) {
        return ResponseEntity.ok(
                ApiResponse.success(documentService.getDocumentsByDeal(dealId)));
    }

    // ── File download ────────────────────────────────────────────────────────

    /**
     * Serve the physical file for download.
     * Accessible to ALL authenticated users (BUYER included).
     * NOTE: does NOT call getDocumentById() to avoid its ADMIN/AGENT/SELLER restriction.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        // Use entity method directly — avoids the ADMIN/AGENT/SELLER @PreAuthorize on getDocumentById()
        com.realestate.entity.Document doc = documentService.getDocumentEntityById(id);
        if (doc.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path filePath = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = doc.getFileType() != null
                    ? doc.getFileType()
                    : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + doc.getFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── Write endpoints (Admin / Agent only) ─────────────────────────────────

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<DocumentDto.Response>> createDocument(
            @RequestPart(value = "document") String documentJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        DocumentDto.Request request = objectMapper.readValue(documentJson, DocumentDto.Request.class);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document created",
                        documentService.createDocument(request, file)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<DocumentDto.Response>> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentDto.Request request) {
        return ResponseEntity.ok(
                ApiResponse.success("Document updated",
                        documentService.updateDocument(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
