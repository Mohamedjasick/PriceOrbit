package com.priceorbit.controller;

import com.priceorbit.model.Product;
import com.priceorbit.model.User;
import com.priceorbit.repository.ProductRepository;
import com.priceorbit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users") // all endpoints here start with /api/users
public class UserController {

    @Autowired
    private UserRepository userRepository; // to find and update users in MongoDB

    @Autowired
    private ProductRepository productRepository; // to look up products by ID

    // -----------------------------------------------------------------------
    // GET /api/users/{id}/saved
    // Returns the list of saved products for a specific user
    // -----------------------------------------------------------------------
    @GetMapping("/{id}/saved")
    public ResponseEntity<?> getSavedProducts(@PathVariable String id) {

        // Find the user by their MongoDB ID
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Get the list of saved product IDs from the user document
        List<String> savedIds = user.getSavedProducts();

        if (savedIds == null || savedIds.isEmpty()) {
            return ResponseEntity.ok(List.of()); // return empty list, not an error
        }

        // Look up each product by ID from the products collection
        List<Product> savedProducts = productRepository.findAllById(savedIds);

        return ResponseEntity.ok(savedProducts);
    }

    // -----------------------------------------------------------------------
    // POST /api/users/{id}/saved
    // Adds a product ID to the user's saved list
    // Body: { "productId": "abc123" }
    // -----------------------------------------------------------------------
    @PostMapping("/{id}/saved")
    public ResponseEntity<?> saveProduct(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String productId = body.get("productId");

        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId is required"));
        }

        // Find the user
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Initialize list if it's null (first time saving)
        if (user.getSavedProducts() == null) {
            user.setSavedProducts(new java.util.ArrayList<>());
        }

        // Only add if not already saved (no duplicates)
        if (!user.getSavedProducts().contains(productId)) {
            user.getSavedProducts().add(productId);
            userRepository.save(user); // save updated user back to MongoDB
        }

        return ResponseEntity.ok(Map.of("message", "Product saved successfully"));
    }

    // -----------------------------------------------------------------------
    // DELETE /api/users/{id}/saved/{productId}
    // Removes a product ID from the user's saved list
    // -----------------------------------------------------------------------
    @DeleteMapping("/{id}/saved/{productId}")
    public ResponseEntity<?> removeSavedProduct(
            @PathVariable String id,
            @PathVariable String productId) {

        // Find the user
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Remove the product ID from the saved list
        if (user.getSavedProducts() != null) {
            user.getSavedProducts().remove(productId);
            userRepository.save(user); // save updated user back to MongoDB
        }

        return ResponseEntity.ok(Map.of("message", "Product removed successfully"));
    }
}