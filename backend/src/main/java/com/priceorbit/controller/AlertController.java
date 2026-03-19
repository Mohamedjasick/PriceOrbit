package com.priceorbit.controller;

import com.priceorbit.model.Alert;
import com.priceorbit.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AlertController.java — REST API endpoints for the price alerts system.
 *
 * All endpoints are prefixed with /api/alerts
 *
 * Endpoints:
 *   POST   /api/alerts                        → Create a new alert
 *   GET    /api/alerts/user/{userId}           → Get all alerts for a user
 *   DELETE /api/alerts/{alertId}/user/{userId} → Delete a specific alert
 *   POST   /api/alerts/check                  → Manually trigger the alert check
 *   GET    /api/alerts/user/{userId}/count     → Get alert count for Profile page
 *
 * Note: SecurityConfig already has .anyRequest().permitAll() so no extra
 * security config is needed here — JWT is handled at the filter level.
 */
@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend to call these endpoints
public class AlertController {

    @Autowired
    private AlertService alertService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/alerts — Create a new price alert
    // ─────────────────────────────────────────────────────────────

    /**
     * Request body (JSON):
     * {
     *   "userId":      "abc123",
     *   "productId":   "xyz789",
     *   "targetPrice": 45000
     * }
     *
     * Response: the saved Alert object as JSON
     */
    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody Map<String, Object> body) {

        // Extract fields from the incoming JSON body
        String userId = (String) body.get("userId");
        String productId = (String) body.get("productId");

        // targetPrice comes in as a Number — cast safely to double
        double targetPrice = ((Number) body.get("targetPrice")).doubleValue();

        // Validate that required fields are present
        if (userId == null || productId == null || targetPrice <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId, productId, and targetPrice are required"));
        }

        // Delegate to service layer
        Alert alert = alertService.createAlert(userId, productId, targetPrice);

        if (alert == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product not found"));
        }

        // 200 OK with the created/existing alert
        return ResponseEntity.ok(alert);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/alerts/user/{userId} — Fetch all alerts for a user
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns a list of all alerts (active + triggered) for the given user.
     * The frontend will sort/filter them by the "triggered" field.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> getUserAlerts(@PathVariable String userId) {
        List<Alert> alerts = alertService.getAlertsForUser(userId);
        return ResponseEntity.ok(alerts);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/alerts/{alertId}/user/{userId} — Delete an alert
    // ─────────────────────────────────────────────────────────────

    /**
     * Deletes a specific alert.
     * userId is included in the path so the service can verify ownership
     * before deleting — prevents one user from deleting another's alerts.
     */
    @DeleteMapping("/{alertId}/user/{userId}")
    public ResponseEntity<?> deleteAlert(
            @PathVariable String alertId,
            @PathVariable String userId) {

        boolean deleted = alertService.deleteAlert(alertId, userId);

        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Alert deleted successfully"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Alert not found or access denied"));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/alerts/check — Manually run the alert checker
    // ─────────────────────────────────────────────────────────────

    /**
     * Scans all untriggered alerts and fires any whose target price is now met.
     *
     * In production this would be called automatically on a schedule.
     * During development, hit this endpoint manually after seeding or
     * updating product prices to test the trigger logic.
     *
     * Response: { "triggered": 3 }  ← number of alerts newly triggered
     */
    @PostMapping("/check")
    public ResponseEntity<?> checkAlerts() {
        int count = alertService.checkAndTriggerAlerts();
        return ResponseEntity.ok(Map.of(
                "message", "Alert check complete",
                "triggered", count
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/alerts/user/{userId}/count — Alert count for Profile
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns the total number of alerts a user has set.
     * Used by the Profile page to show a quick summary stat.
     *
     * Response: { "count": 5 }
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<?> getAlertCount(@PathVariable String userId) {
        long count = alertService.countAlertsForUser(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}