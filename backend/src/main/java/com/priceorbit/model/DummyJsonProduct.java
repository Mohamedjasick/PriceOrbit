package com.priceorbit.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) that maps the JSON response from DummyJSON API.
 *
 * DummyJSON returns products in this shape:
 * {
 *   "products": [
 *     {
 *       "id": 1,
 *       "title": "iPhone 9",
 *       "description": "An apple mobile...",
 *       "price": 549.99,
 *       "thumbnail": "https://...",
 *       "category": "smartphones",
 *       "brand": "Apple",
 *       "rating": 4.69
 *     },
 *     ...
 *   ],
 *   "total": 100,
 *   "skip": 0,
 *   "limit": 30
 * }
 *
 * @JsonIgnoreProperties(ignoreUnknown = true) tells Jackson to silently
 * ignore any fields in the JSON that don't have a matching field here.
 * This prevents deserialization errors if DummyJSON adds new fields later.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DummyJsonProduct {

    // DummyJSON uses "title" — we'll map this to Product.name
    private String title;

    // Base price in USD from DummyJSON — we'll apply ±5–15% to simulate retailers
    private double price;

    // Full description text
    private String description;

    // Product category e.g. "smartphones", "laptops"
    private String category;

    // Brand name e.g. "Apple", "Samsung"
    private String brand;

    // Thumbnail image URL — smaller/faster than the full images array
    private String thumbnail;

    /**
     * Inner class that maps the top-level DummyJSON response wrapper.
     *
     * We need this because DummyJSON doesn't return a bare array —
     * it wraps the products list inside { "products": [...] }.
     * RestTemplate needs a concrete class to deserialize into.
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {

        // The actual list of products returned by DummyJSON
        private java.util.List<DummyJsonProduct> products;
    }
}