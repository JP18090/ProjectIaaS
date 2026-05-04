package com.projectiaas.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public record ReportResponse(
        int totalVehicles,
        long available,
        long sold,
        BigDecimal avgPrice,
        Map<String, Long> byBrand,
        LocalDateTime lastUpdate) {
}