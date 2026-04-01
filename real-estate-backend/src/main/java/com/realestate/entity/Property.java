package com.realestate.entity;

import com.realestate.enums.PropertyStatus;
import com.realestate.enums.PropertyType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    private String district;

    // Base / starting price
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    // Total land/site area
    private Double sizeInSqft;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // ── LAND specific ──────────────────────────────────────────────────────────
    private Integer totalBlocks;

    @Column(precision = 15, scale = 2)
    private BigDecimal pricePerBlock;

    // ── APARTMENT specific ─────────────────────────────────────────────────────
    private Integer totalFloors;
    private Integer unitsPerFloor;

    @Column(precision = 15, scale = 2)
    private BigDecimal pricePerUnit;

    private Integer yearBuilt;
    private Boolean hasParking;
    private Boolean hasGym;
    private Boolean hasPool;

    // ── Relations ──────────────────────────────────────────────────────────────
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LandBlock> landBlocks = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ApartmentUnit> apartmentUnits = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PropertyImage> images = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PropertyStatus.AVAILABLE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
