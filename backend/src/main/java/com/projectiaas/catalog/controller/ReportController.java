package com.projectiaas.catalog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectiaas.catalog.dto.ReportResponse;
import com.projectiaas.catalog.service.ReportService;

@RestController
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/report")
    public ReportResponse getReport() {
        return reportService.generate();
    }
}