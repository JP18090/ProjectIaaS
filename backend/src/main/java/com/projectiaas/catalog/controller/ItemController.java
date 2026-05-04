package com.projectiaas.catalog.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projectiaas.catalog.dto.VehicleRequest;
import com.projectiaas.catalog.dto.VehicleResponse;
import com.projectiaas.catalog.image.VehicleImageResponse;
import com.projectiaas.catalog.image.VehicleImageService;
import com.projectiaas.catalog.service.VehicleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/items")
public class ItemController {

    private final VehicleService vehicleService;
    private final VehicleImageService vehicleImageService;

    public ItemController(VehicleService vehicleService, VehicleImageService vehicleImageService) {
        this.vehicleService = vehicleService;
        this.vehicleImageService = vehicleImageService;
    }

    @GetMapping
    public List<VehicleResponse> findAll() {
        return vehicleService.findAll();
    }

    @GetMapping("/{id}")
    public VehicleResponse findById(@PathVariable Long id) {
        return vehicleService.findById(id);
    }

    @GetMapping("/{id}/images")
    public List<VehicleImageResponse> findImagesById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {
        return vehicleImageService.findByVehicleId(id, limit);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse created = vehicleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public VehicleResponse update(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }
}