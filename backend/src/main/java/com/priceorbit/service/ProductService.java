package com.priceorbit.service;

import com.priceorbit.model.PricePoint;
import com.priceorbit.model.Product;
import com.priceorbit.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ProductService handles all business logic for product queries.
 * It talks to MongoDB via ProductRepository.
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Search products by query string and optional category filter.
     * Matches against name, brand, description, and category fields.
     * Uses case-insensitive partial matching — "sam" matches "Samsung Galaxy".
     *
     * @param query    the search term (can be empty or null)
     * @param category optional category filter e.g. "Phones" (can be null)
     * @return list of matching products, or all products if query is blank
     */
    public List<Product> searchProducts(String query, String category) {

        // Start with all products from MongoDB
        List<Product> all = productRepository.findAll();

        // If query is null or blank, use all products (handles Deals page case)
        String lowerQuery = (query == null || query.trim().isEmpty())
                ? null
                : query.trim().toLowerCase();

        // Apply text search filter if a query was provided
        if (lowerQuery != null) {
            all = all.stream()
                .filter(product -> {
                    // Match against product name
                    boolean nameMatch = product.getName() != null &&
                        product.getName().toLowerCase().contains(lowerQuery);

                    // Match against brand field
                    boolean brandMatch = product.getBrand() != null &&
                        product.getBrand().toLowerCase().contains(lowerQuery);

                    // Match against description
                    boolean descMatch = product.getDescription() != null &&
                        product.getDescription().toLowerCase().contains(lowerQuery);

                    // Match against category
                    boolean catMatch = product.getCategory() != null &&
                        product.getCategory().toLowerCase().contains(lowerQuery);

                    return nameMatch || brandMatch || descMatch || catMatch;
                })
                .collect(Collectors.toList());
        }

        // Apply category filter if provided (separate from text search)
        if (category != null && !category.trim().isEmpty()) {
            String lowerCat = category.trim().toLowerCase();
            all = all.stream()
                .filter(p -> p.getCategory() != null &&
                    p.getCategory().toLowerCase().equals(lowerCat))
                .collect(Collectors.toList());
        }

        return all;
    }

    /**
     * Returns a distinct sorted list of all category names in the database.
     * Used by GET /api/categories to populate filter dropdowns.
     *
     * @return sorted list of unique category strings
     */
    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
            .map(Product::getCategory)           // extract category from each product
            .filter(c -> c != null && !c.isEmpty()) // drop nulls/blanks
            .distinct()                           // remove duplicates
            .sorted()                             // alphabetical order
            .collect(Collectors.toList());
    }

    /**
     * Get a single product by its MongoDB document ID.
     * Returns Optional so the controller can return 404 cleanly if not found.
     *
     * @param id the MongoDB _id string
     * @return Optional containing the Product, or empty Optional if not found
     */
    public Optional<Product> getProductById(String id) {
        // ProductRepository extends MongoRepository which already returns Optional
        return productRepository.findById(id);
    }

    /**
     * Get ONLY the price history array for a product.
     * Used by GET /api/products/{id}/history — lighter than loading the full product.
     *
     * @param id the MongoDB _id string
     * @return Optional containing the PricePoint list, or empty if product not found
     */
    public Optional<List<PricePoint>> getPriceHistory(String id) {
        return productRepository.findById(id)
            .map(Product::getPriceHistory); // extract just the priceHistory field
    }

    /**
     * Get all products — used by admin/debug views.
     *
     * @return every product in the database
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}