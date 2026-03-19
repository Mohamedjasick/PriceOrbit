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
 */
@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/search?query=phone
     * GET /api/search?query=phone&category=Phones
     * GET /api/search           ← query is now optional (defaults to "")
     *
     * When query is blank, ProductService returns ALL products.
     * This fixes the Deals page which calls /api/search with no query param.
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
     * Returns a distinct sorted list of all category names.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    /**
     * GET /api/products/{id}
     * Returns a single full product. 404 if not found.
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
     * Lighter than loading the full product — the chart only needs this data.
     *
     * 200 OK        → price history array (may be empty [])
     * 404 Not Found → product ID doesn't exist
     */
    @GetMapping("/products/{id}/history")
    public ResponseEntity<List<PricePoint>> getPriceHistory(@PathVariable String id) {
        Optional<List<PricePoint>> history = productService.getPriceHistory(id);
        return history
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}