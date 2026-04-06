package com.priceorbit.controller;

import com.priceorbit.model.PricePoint;
import com.priceorbit.model.Product;
import com.priceorbit.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * ProductController handles all HTTP requests related to products.
 * Delegates actual work to ProductService.
 *
 * Base path: /api
 *
 * CHANGES FROM ORIGINAL:
 * - /api/search now drives DummyJSON fetching via ProductService cache logic.
 *   The endpoint signature is IDENTICAL to before — no frontend changes needed.
 * - All other endpoints are completely unchanged.
 *
 * Response shape is preserved exactly so the frontend works without modification.
 */
@RestController
@RequestMapping("/api")

public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/search?query=phone
     * GET /api/search?query=phone&category=Phones
     * GET /api/search           ← blank query returns all cached products
     *
     * Flow (handled entirely inside ProductService):
     *   1. Normalize query → check MongoDB cache
     *   2. Cache hit + fresh   → return cached products immediately
     *   3. Cache miss/expired  → fetch from DummyJSON, cache in MongoDB, return
     *
     * Response shape: List<Product> — identical to original, no frontend changes needed.
     *
     * Each Product contains:
     *   - name, category, brand, description, imageUrl  (same as before)
     *   - prices: [ { retailer, price, url, lastUpdated }, ... ]  (Amazon + Flipkart in INR)
     *   - priceHistory: [ { date, price }, ... ]  (6 months, INR)
     *   - basePrice   (INR, new field — frontend can ignore if not needed)
     *   - searchQuery (cache key — frontend can ignore)
     *   - cachedAt    (cache timestamp — frontend can ignore)
     */
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false) String category) {

        List<Product> results = productService.searchProducts(query, category);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/categories
     * Returns a distinct sorted list of all category names found in MongoDB.
     * Categories now reflect whatever DummyJSON has returned and cached.
     * Unchanged from original.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    /**
     * GET /api/products/{id}
     * Returns a single full product by MongoDB _id.
     * 404 if not found.
     * Unchanged from original.
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productService.getProductById(id);
        return product
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/products/{id}/history
     * Returns ONLY the priceHistory array for a product.
     * Lighter than loading the full product — the chart only needs this.
     *
     * 200 OK        → price history array (INR values, 6 monthly points)
     * 404 Not Found → product ID doesn't exist in MongoDB
     *
     * Unchanged from original.
     */
    @GetMapping("/products/{id}/history")
    public ResponseEntity<List<PricePoint>> getPriceHistory(@PathVariable String id) {
        Optional<List<PricePoint>> history = productService.getPriceHistory(id);
        return history
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}