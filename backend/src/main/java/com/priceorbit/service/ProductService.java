package com.priceorbit.service;

import com.priceorbit.model.PricePoint;
import com.priceorbit.model.Product;
import com.priceorbit.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ProductService handles all business logic for product queries.
 *
 * UPDATED FLOW for search:
 *   1. Normalize the query (lowercase + trim)
 *   2. Check MongoDB for cached results for this query
 *   3. If cache hit AND not expired (< 24 hours old) → return cached results
 *   4. If cache miss OR expired → call DummyJsonService to fetch from DummyJSON
 *   5. Delete any stale cached docs for this query, save fresh ones, return them
 *
 * Everything else (getById, getCategories, getPriceHistory) is unchanged.
 */
@Service
public class ProductService {

    // ---------------------------------------------------------------
    // Dependencies
    // ---------------------------------------------------------------

    @Autowired
    private ProductRepository productRepository;

    /**
     * DummyJsonService handles the external API call + price simulation.
     * Injected here so ProductService stays focused on cache logic only.
     */
    @Autowired
    private DummyJsonService dummyJsonService;

    // ---------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------

    /**
     * Cache TTL: how many hours a cached search result is considered fresh.
     * After 24 hours, the next search for the same query re-fetches DummyJSON.
     * Change this value to adjust caching behaviour without touching logic.
     */
    private static final long CACHE_TTL_HOURS = 24;

    // ---------------------------------------------------------------
    // Search — main updated method
    // ---------------------------------------------------------------

    /**
     * Search products by query string and optional category filter.
     *
     * If query is blank (e.g. Deals page calling /api/search with no param),
     * we return whatever is already cached in MongoDB across all queries.
     * This avoids calling DummyJSON with an empty string.
     *
     * @param query    the search term from the frontend (can be null/blank)
     * @param category optional category filter (can be null)
     * @return list of matching Product documents
     */
    public List<Product> searchProducts(String query, String category) {

        // ------------------------------------------------------------------
        // Step 1: Normalize the query
        // ------------------------------------------------------------------
        // Trim whitespace and convert to lowercase so "iPhone", "iphone",
        // and " IPHONE " all map to the same cache key: "iphone"
        String normalizedQuery = (query == null || query.trim().isEmpty())
                ? null
                : query.trim().toLowerCase();

        // ------------------------------------------------------------------
        // Step 2: Handle blank query — return all cached products
        // ------------------------------------------------------------------
        // The Deals page calls /api/search with no query param.
        // We don't want to hit DummyJSON with an empty search,
        // so we just return whatever is already in MongoDB.
        if (normalizedQuery == null) {
            return applyCategory(productRepository.findAll(), category);
        }

        // ------------------------------------------------------------------
        // Step 3: Check MongoDB cache for this query
        // ------------------------------------------------------------------
        // findBySearchQuery() looks for all Product documents where the
        // searchQuery field matches our normalized query string exactly.
        // This is defined in ProductRepository (you'll need to add it there).
        List<Product> cached = productRepository.findBySearchQuery(normalizedQuery);

        // ------------------------------------------------------------------
        // Step 4: Validate cache freshness
        // ------------------------------------------------------------------
        // If we got cached results, check if they are still fresh.
        // We look at the cachedAt timestamp of the first result —
        // all products from the same search were cached at the same time.
        boolean cacheValid = !cached.isEmpty()
                && cached.get(0).getCachedAt() != null
                && cached.get(0).getCachedAt()
                         .isAfter(Instant.now().minus(CACHE_TTL_HOURS, ChronoUnit.HOURS));

        if (cacheValid) {
            // Cache hit — return cached results directly, no DummyJSON call needed
            System.out.println("✅ Cache hit for query: " + normalizedQuery);
            return applyCategory(cached, category);
        }

        // ------------------------------------------------------------------
        // Step 5: Cache miss or expired — fetch fresh data from DummyJSON
        // ------------------------------------------------------------------
        System.out.println("🔄 Cache miss for query: " + normalizedQuery
                + " — fetching from DummyJSON");

        List<Product> fresh = dummyJsonService.fetchAndBuild(normalizedQuery);

        // ------------------------------------------------------------------
        // Step 6: Persist fresh results to MongoDB
        // ------------------------------------------------------------------
        if (!fresh.isEmpty()) {
            // Delete stale cached documents for this query before saving new ones.
            // Without this, old and new results for the same query would coexist
            // in MongoDB and the cache check in Step 3 would return a mix of both.
            if (!cached.isEmpty()) {
                productRepository.deleteAll(cached);
                System.out.println("🗑️ Deleted " + cached.size()
                        + " stale cached products for query: " + normalizedQuery);
            }

            // Save all fresh products in one batch operation
            productRepository.saveAll(fresh);
            System.out.println("💾 Saved " + fresh.size()
                    + " products to MongoDB for query: " + normalizedQuery);
        }

        // ------------------------------------------------------------------
        // Step 7: Apply optional category filter and return
        // ------------------------------------------------------------------
        return applyCategory(fresh, category);
    }

    // ---------------------------------------------------------------
    // Unchanged methods from original ProductService
    // ---------------------------------------------------------------

    /**
     * Returns a distinct sorted list of all category names in the database.
     * Used by GET /api/categories to populate filter dropdowns.
     * Now reflects categories from DummyJSON results cached in MongoDB.
     *
     * @return sorted list of unique category strings
     */
    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
            .map(Product::getCategory)
            .filter(c -> c != null && !c.isEmpty())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }

    /**
     * Get a single product by its MongoDB document ID.
     * Returns Optional so the controller can return 404 cleanly if not found.
     *
     * @param id the MongoDB _id string
     * @return Optional containing the Product, or empty if not found
     */
    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    /**
     * Get ONLY the price history array for a product.
     * Used by GET /api/products/{id}/history.
     *
     * @param id the MongoDB _id string
     * @return Optional containing the PricePoint list, or empty if not found
     */
    public Optional<List<PricePoint>> getPriceHistory(String id) {
        return productRepository.findById(id)
            .map(Product::getPriceHistory);
    }

    /**
     * Get all products — used by admin/debug views and blank query fallback.
     *
     * @return every product in the database
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    /**
     * Applies an optional category filter to a list of products.
     * Extracted into a helper so both the cache-hit and cache-miss paths
     * go through exactly the same filtering logic.
     *
     * @param products list to filter
     * @param category category string to match (null = no filter)
     * @return filtered list, or original list if category is null/blank
     */
    private List<Product> applyCategory(List<Product> products, String category) {
        if (category == null || category.trim().isEmpty()) {
            return products; // no filter — return as-is
        }

        String lowerCat = category.trim().toLowerCase();
        return products.stream()
            .filter(p -> p.getCategory() != null
                    && p.getCategory().toLowerCase().equals(lowerCat))
            .collect(Collectors.toList());
    }
}