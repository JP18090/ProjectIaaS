package com.projectiaas.catalog.fipe.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectiaas.catalog.fipe.dto.FipeOptionResponse;
import com.projectiaas.catalog.fipe.dto.FipeVehicleInfoResponse;
import com.projectiaas.catalog.fipe.service.FipeService;

@RestController
@RequestMapping("/fipe")
public class FipeController {

    private final FipeService fipeService;

    public FipeController(FipeService fipeService) {
        this.fipeService = fipeService;
    }

    @GetMapping("/brands")
    public List<FipeOptionResponse> getBrands() {
        return fipeService.getBrands();
    }

    @GetMapping("/brands/{brandId}/models")
    public List<FipeOptionResponse> getModels(@PathVariable String brandId) {
        return fipeService.getModels(brandId);
    }

    @GetMapping("/brands/{brandId}/models/{modelId}/years")
    public List<FipeOptionResponse> getYears(
            @PathVariable String brandId,
            @PathVariable String modelId) {
        return fipeService.getYears(brandId, modelId);
    }

    @GetMapping("/brands/{brandId}/models/{modelId}/years/{yearId}")
    public FipeVehicleInfoResponse getVehicleInfo(
            @PathVariable String brandId,
            @PathVariable String modelId,
            @PathVariable String yearId) {
        return fipeService.getVehicleInfo(brandId, modelId, yearId);
    }
}