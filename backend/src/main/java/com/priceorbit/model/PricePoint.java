package com.priceorbit.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PricePoint represents a single entry in a product's price history.
 * Each entry has a date label (e.g. "Jan 2024") and a price (e.g. 79999.0).
 *
 * Used by:
 *  - Product.priceHistory (List<PricePoint>)
 *  - DataSeeder.makePriceHistory()
 *  - ProductService.recordStartupPrices() — appends new points on startup
 *  - GET /api/products/{id}/history — returns List<PricePoint>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePoint {

    // Date label — e.g. "Jan 2024", "Mar 16"
    // Kept as String to match seeded data and frontend chart dataKey="date"
    private String date;

    // Price on this date — lowest across all retailers at that time
    private double price;
}