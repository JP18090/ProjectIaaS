package com.projectiaas.catalog.dto;

import java.math.BigDecimal;
import java.time.Year;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record VehicleRequest(
        @NotBlank @Size(max = 50) String brand,
        @NotBlank @Size(max = 100) String model,
        @NotNull @Min(1950) @Max(2500) Integer year,
        @Size(max = 30) String color,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @PositiveOrZero Integer mileage,
        @Size(max = 20) String fuelType,
        @Size(max = 20) String transmission,
        @NotBlank @Pattern(regexp = "available|reserved|sold", message = "status deve ser available, reserved ou sold") String status) {

    public VehicleRequest {
        int maxYear = Year.now().getValue() + 1;
        if (year != null && year > maxYear) {
            throw new IllegalArgumentException("year deve ser menor ou igual a " + maxYear);
        }
    }
}