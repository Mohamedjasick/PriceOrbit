package com.priceorbit.service;

import com.priceorbit.model.Alert;
import com.priceorbit.model.Product;
import com.priceorbit.repository.AlertRepository;
import com.priceorbit.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * AlertService.java — Business logic for the price alerts system.
 *
 * This service handles:
 *   1. Creating a new alert for a user on a product
 *   2. Fetching all alerts for a user
 *   3. Deleting an alert
 *   4. Checking all active alerts to see if any should be triggered
 *
 * The "check" logic is the core of the system:
 *   - For every untriggered alert, we look up the product's current prices
 *   - If the best (lowest) price is at or below the user's target, we mark it triggered
 *   - In a real app this would run on a schedule (e.g. every hour via @Scheduled)
 *     but here we also expose it as a manual endpoint so you can test it instantly
 */
@Service
public class AlertService {

    // Repository to read/write alerts in MongoDB
    @Autowired
    private AlertRepository alertRepository;

    // Repository to look up product prices when checking alerts
    @Autowired
    private ProductRepository productRepository;

    // ─────────────────────────────────────────────────────────────
    // CREATE — Set a new price alert
    // ─────────────────────────────────────────────────────────────

    /**
     * Creates a new alert for a user on a specific product.
     *
     * Steps:
     *   1. Look up the product to get its current best price
     *   2. Check if the user already has an alert for this product (no duplicates)
     *   3. Save the new alert to MongoDB
     *
     * @param userId     - the logged-in user's ID
     * @param productId  - the product they want to track
     * @param targetPrice - the price they want to be alerted at
     * @return the saved Alert object, or null if duplicate exists
     */
    public Alert createAlert(String userId, String productId, double targetPrice) {

        // Step 1: Look up the product to get its name, image, and current price
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            // Product doesn't exist — can't create alert
            return null;
        }
        Product product = productOpt.get();

        // Step 2: Check for duplicate alert (same user + same product)
        List<Alert> existing = alertRepository.findByUserIdAndProductId(userId, productId);
        if (!existing.isEmpty()) {
            // User already has an alert for this product — return the existing one
            return existing.get(0);
        }

        // Step 3: Find the current best price across all platforms
        // Product stores a list of prices (one per platform like Amazon, Flipkart)
        // We find the minimum price among all platforms
        double currentBestPrice = product.getPrices().stream()
                .mapToDouble(p -> p.getPrice())
                .min()
                .orElse(0.0);

        // Step 4: Build and save the new alert
        Alert alert = new Alert(
                userId,
                productId,
                product.getName(),
                product.getImageUrl(),
                targetPrice,
                currentBestPrice   // price at the time alert was created
        );

        // Immediately check if the target is already met
        if (currentBestPrice <= targetPrice) {
            alert.setTriggered(true);
            alert.setCurrentPrice(currentBestPrice);
            alert.setTriggeredAt(LocalDateTime.now());
        }

        return alertRepository.save(alert);
    }

    // ─────────────────────────────────────────────────────────────
    // READ — Get alerts for a user
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns all alerts (both active and triggered) for a given user.
     */
    public List<Alert> getAlertsForUser(String userId) {
        return alertRepository.findByUserId(userId);
    }

    /**
     * Returns only the active (not yet triggered) alerts for a user.
     */
    public List<Alert> getActiveAlertsForUser(String userId) {
        // false = not triggered = still active
        return alertRepository.findByUserIdAndTriggered(userId, false);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE — Remove an alert
    // ─────────────────────────────────────────────────────────────

    /**
     * Deletes an alert by its ID.
     * We also verify it belongs to the requesting user for basic security.
     *
     * @return true if deleted, false if not found or doesn't belong to user
     */
    public boolean deleteAlert(String alertId, String userId) {
        Optional<Alert> alertOpt = alertRepository.findById(alertId);

        if (alertOpt.isEmpty()) {
            return false; // Alert doesn't exist
        }

        Alert alert = alertOpt.get();

        // Security check: only the owner can delete their alert
        if (!alert.getUserId().equals(userId)) {
            return false;
        }

        alertRepository.deleteById(alertId);
        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // CHECK — Scan all active alerts and trigger if price is met
    // ─────────────────────────────────────────────────────────────

    /**
     * Scans every untriggered alert in the database and checks if
     * the product's current price has dropped to or below the target.
     *
     * In production this would be called by a scheduled job (e.g. @Scheduled).
     * Here it's also exposed as a manual API endpoint for easy testing.
     *
     * @return number of alerts that were newly triggered
     */
    public int checkAndTriggerAlerts() {
        // Get every alert that hasn't been triggered yet
        List<Alert> activeAlerts = alertRepository.findByTriggered(false);

        int triggeredCount = 0;

        for (Alert alert : activeAlerts) {
            // Look up the product's current prices
            Optional<Product> productOpt = productRepository.findById(alert.getProductId());

            if (productOpt.isEmpty()) {
                continue; // Product was deleted — skip this alert
            }

            Product product = productOpt.get();

            // Find the best (lowest) current price across all platforms
            double bestPrice = product.getPrices().stream()
                    .mapToDouble(p -> p.getPrice())
                    .min()
                    .orElse(Double.MAX_VALUE);

            // Update the stored current price so UI can show it
            alert.setCurrentPrice(bestPrice);

            // Check if the target has been met
            if (bestPrice <= alert.getTargetPrice()) {
                alert.setTriggered(true);
                alert.setTriggeredAt(LocalDateTime.now());
                triggeredCount++;
            }

            // Save the updated alert back to MongoDB
            alertRepository.save(alert);
        }

        return triggeredCount;
    }

    // ─────────────────────────────────────────────────────────────
    // STATS — Count alerts for a user (used by Profile page)
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns the total number of alerts a user has set.
     * Used on the Profile page to show a summary stat.
     */
    public long countAlertsForUser(String userId) {
        return alertRepository.findByUserId(userId).size();
    }
}
