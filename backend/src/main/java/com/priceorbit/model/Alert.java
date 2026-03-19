package com.priceorbit.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Alert.java — MongoDB document model for price alerts.
 *
 * Each alert stores:
 *   - which user set it (userId)
 *   - which product it's for (productId, productName, productImage)
 *   - the target price the user wants to be alerted at
 *   - the current price at the time the alert was created
 *   - whether the alert has been triggered (currentPrice <= targetPrice)
 *   - timestamps for creation and triggering
 *
 * Stored in the "alerts" collection in MongoDB Atlas.
 */
@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    // The user who created this alert
    private String userId;

    // Product details — stored here so we don't need to join with products collection
    private String productId;
    private String productName;
    private String productImage;

    // The price the user wants to buy at
    private double targetPrice;

    // The price at the time the alert was created
    private double priceAtCreation;

    // Current best price (updated when backend checks alerts)
    private double currentPrice;

    // false = still waiting, true = target has been hit
    private boolean triggered;

    // When the alert was created
    private LocalDateTime createdAt;

    // When the alert was triggered (null if not yet triggered)
    private LocalDateTime triggeredAt;

    // ─── Constructors ──────────────────────────────────────────────

    public Alert() {}

    public Alert(String userId, String productId, String productName,
                 String productImage, double targetPrice, double priceAtCreation) {
        this.userId = userId;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.targetPrice = targetPrice;
        this.priceAtCreation = priceAtCreation;
        this.currentPrice = priceAtCreation;
        this.triggered = false;
        this.createdAt = LocalDateTime.now();
        this.triggeredAt = null;
    }

    // ─── Getters & Setters ─────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public double getTargetPrice() { return targetPrice; }
    public void setTargetPrice(double targetPrice) { this.targetPrice = targetPrice; }

    public double getPriceAtCreation() { return priceAtCreation; }
    public void setPriceAtCreation(double priceAtCreation) { this.priceAtCreation = priceAtCreation; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public boolean isTriggered() { return triggered; }
    public void setTriggered(boolean triggered) { this.triggered = triggered; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; }
}