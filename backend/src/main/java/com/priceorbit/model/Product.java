package com.priceorbit.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;
    private String category;
    private String brand;
    private String description;
    private String imageUrl;

    // List of prices from different retailers (Amazon, Flipkart)
    private List<RetailerPrice> prices;

    // 6-month price history — each PricePoint has { date, price }
    private List<PricePoint> priceHistory;

    // ---------------------------------------------------------------
    // NEW FIELDS added for DummyJSON caching support
    // ---------------------------------------------------------------

    /**
     * The normalized search query that produced this product.
     * Example: if user searched "iphone", this is "iphone".
     *
     * Used as the cache lookup key in ProductService:
     *   productRepository.findBySearchQuery("iphone")
     * → returns all products cached from that search, skipping DummyJSON.
     *
     * Stored in lowercase + trimmed so "iPhone" and "iphone" hit the same cache.
     */
    private String searchQuery;

    /**
     * The timestamp (UTC) when this product was fetched from DummyJSON
     * and saved into MongoDB.
     *
     * Used to implement cache TTL (time-to-live):
     *   if (Instant.now() - cachedAt > 24 hours) → re-fetch from DummyJSON
     *
     * Stored as java.time.Instant which MongoDB serializes as a BSON Date.
     * Instant.now() always gives UTC so there's no timezone confusion.
     */
    private Instant cachedAt;

    /**
     * The base price fetched directly from DummyJSON (in USD).
     * Amazon and Flipkart prices are derived from this by applying
     * a ±5–15% random variation in DummyJsonService.
     *
     * Stored here so the frontend can show "Base Price" alongside
     * retailer-specific prices if needed.
     */
    private Double basePrice;
}