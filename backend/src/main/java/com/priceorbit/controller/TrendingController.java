// FILE: com/priceorbit/controller/TrendingController.java

package com.priceorbit.controller;

import com.priceorbit.model.Product;
import com.priceorbit.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// ─── TrendingController ────────────────────────────────────────────────────
// Provides the /api/trending endpoint that returns "trending" products.
//
// Since we don't have real view/click tracking yet, we simulate trending by:
//   1. Returning the products that appear most in users' saved lists (most-saved)
//   2. Falling back to a fixed selection if no saves exist yet
//
// This uses the existing products and users collections — no new DB tables needed.

@RestController
@RequestMapping("/api/trending")
@CrossOrigin(origins = "http://localhost:3000") // allow React frontend
public class TrendingController {

    @Autowired
    private ProductRepository productRepository;

    // We also need the user repository to count how many users saved each product
    @Autowired
    private com.priceorbit.repository.UserRepository userRepository;

    // ── GET /api/trending ──────────────────────────────────────────────────
    // Returns up to 8 trending products, ranked by how many users saved them.
    // If no saves exist yet, returns the first 8 products as a fallback.
    @GetMapping
    public List<Product> getTrendingProducts() {

        // Step 1: Get all users from the database
        List<com.priceorbit.model.User> allUsers = userRepository.findAll();

        // Step 2: Count how many users have saved each product ID
        // Map structure: { "productId" -> saveCount }
        Map<String, Long> saveCountMap = allUsers.stream()
            // flatMap turns each user's savedProductIds list into a single stream of IDs
            .flatMap(user -> {
                List<String> saved = user.getSavedProducts();
                // Guard against users with null savedProductIds list
                return (saved != null) ? saved.stream() : java.util.stream.Stream.empty();
            })
            // Group by product ID and count occurrences
            .collect(Collectors.groupingBy(
                id -> id,           // key = product ID string
                Collectors.counting() // value = number of users who saved it
            ));

        // Step 3: Fetch all products from MongoDB
        List<Product> allProducts = productRepository.findAll();

        // Step 4: If we have save data, sort products by save count descending
        if (!saveCountMap.isEmpty()) {
            allProducts.sort((a, b) -> {
                // Get save count for each product (default 0 if never saved)
                long countA = saveCountMap.getOrDefault(a.getId(), 0L);
                long countB = saveCountMap.getOrDefault(b.getId(), 0L);
                // Sort descending (most saved first)
                return Long.compare(countB, countA);
            });
        }
        // If saveCountMap is empty (no one has saved anything yet),
        // allProducts stays in its natural DB order — still a valid fallback.

        // Step 5: Return top 8 products maximum
        return allProducts.stream()
            .limit(8)
            .collect(Collectors.toList());
    }

    // ── GET /api/trending/count ────────────────────────────────────────────
    // Helper endpoint — returns the save count for every product.
    // Used by the frontend to show "X users saved this" badges.
    // Returns a list of objects: [{ productId, saveCount }, ...]
    @GetMapping("/count")
    public List<Map<String, Object>> getSaveCounts() {

        List<com.priceorbit.model.User> allUsers = userRepository.findAll();

        // Build the save count map same as above
        Map<String, Long> saveCountMap = allUsers.stream()
            .flatMap(user -> {
               List<String> saved = user.getSavedProducts();
                return (saved != null) ? saved.stream() : java.util.stream.Stream.empty();
            })
            .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

        // Convert to a list of simple maps so it serialises cleanly to JSON
        return saveCountMap.entrySet().stream()
            .map(entry -> Map.of(
                "productId", (Object) entry.getKey(),
                "saveCount", (Object) entry.getValue()
            ))
            .collect(Collectors.toList());
    }
}