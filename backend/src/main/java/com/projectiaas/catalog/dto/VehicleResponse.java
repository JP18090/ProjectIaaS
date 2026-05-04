package com.projectiaas.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VehicleResponse(
        Long id,
        String brand,
        String model,
        Integer year,
        String color,
        BigDecimal price,
        Integer mileage,
        String fuelType,
        String transmission,
        String status,
        LocalDateTime createdAt) {
}