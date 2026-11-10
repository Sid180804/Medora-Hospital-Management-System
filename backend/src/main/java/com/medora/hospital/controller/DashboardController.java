package com.medora.hospital.controller;

import com.medora.hospital.dto.DashboardSummaryDto;
import com.medora.hospital.dto.TrendPointDto;
import com.medora.hospital.service.DashboardService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendPointDto>> getTrends() {
        return ResponseEntity.ok(dashboardService.getWeeklyTrends());
    }
}
