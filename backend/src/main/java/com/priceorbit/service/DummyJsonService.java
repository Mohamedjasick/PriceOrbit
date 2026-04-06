package com.priceorbit.service;

import com.priceorbit.model.DummyJsonProduct;
import com.priceorbit.model.PricePoint;
import com.priceorbit.model.Product;
import com.priceorbit.model.RetailerPrice;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * DummyJsonService is responsible for:
 *  1. Calling the DummyJSON external API to fetch product search results
 *  2. Converting USD prices → INR
 *  3. Simulating Amazon and Flipkart prices using ±5–15% variation
 *  4. Building fully-formed Product documents ready to save into MongoDB
 *
 * This service is called by ProductService ONLY when a cache miss occurs
 * (i.e. the search query has no results in MongoDB, or the cache has expired).
 */
@Service
public class DummyJsonService {

    // ---------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------

    /**
     * USD → INR conversion rate.
     * Update this single constant if the exchange rate changes.
     * 1 USD = 83.5 INR (approximate, April 2026)
     */
    private static final double USD_TO_INR = 83.5;

    /**
     * DummyJSON search endpoint.
     * {query} is replaced at runtime with the user's search term.
     * Example: https://dummyjson.com/products/search?q=iphone
     */
    private static final String DUMMYJSON_URL =
            "https://dummyjson.com/products/search?q={query}";

    /**
     * RestTemplate is Spring's built-in HTTP client.
     * We create it directly here (not @Autowired) because we don't need
     * any custom configuration — default settings work fine for DummyJSON.
     */
    private final RestTemplate restTemplate = new RestTemplate();

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /**
     * Fetches products from DummyJSON for the given search query,
     * then converts and enriches each product into a Product document.
     *
     * @param query the user's raw search term e.g. "iphone"
     * @return list of fully-built Product objects (not yet saved to MongoDB)
     */
    public List<Product> fetchAndBuild(String query) {

        // Call DummyJSON API — RestTemplate automatically deserializes the
        // JSON response into DummyJsonProduct.Response using Jackson.
        // The {query} placeholder in the URL is replaced with the actual query.
        DummyJsonProduct.Response response = restTemplate.getForObject(
                DUMMYJSON_URL,
                DummyJsonProduct.Response.class,
                query  // replaces {query} in the URL template
        );

        // If DummyJSON returned nothing (null response or empty list), return empty
        if (response == null || response.getProducts() == null) {
            return List.of();
        }

        // Convert each DummyJSON product into our internal Product model
        List<Product> results = new ArrayList<>();
        for (DummyJsonProduct dp : response.getProducts()) {
            results.add(buildProduct(dp, query));
        }

        return results;
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    /**
     * Converts a single DummyJsonProduct into a fully-formed Product document.
     *
     * Steps:
     *  1. Convert base price USD → INR
     *  2. Simulate Amazon price (base ± random 5–15%)
     *  3. Simulate Flipkart price (base ± random 5–15%)
     *  4. Build a 6-month simulated price history
     *  5. Populate all Product fields and set cache metadata
     *
     * @param dp    the raw DummyJSON product
     * @param query the normalized search query (stored for cache keying)
     * @return a ready-to-save Product document
     */
    private Product buildProduct(DummyJsonProduct dp, String query) {

        // ------------------------------------------------------------------
        // Step 1: Convert base price from USD to INR
        // ------------------------------------------------------------------
        // Round to 2 decimal places to avoid floating-point noise
        double basePriceInr = Math.round(dp.getPrice() * USD_TO_INR * 100.0) / 100.0;

        // ------------------------------------------------------------------
        // Step 2 & 3: Simulate Amazon and Flipkart prices
        // ------------------------------------------------------------------
        // Seed Random with the product title's hashCode so that the same
        // product always gets the same simulated prices across requests.
        // Without seeding, prices would change every time the server restarts.
        Random rng = new Random(dp.getTitle().hashCode());

        double amazonPrice   = simulatePrice(basePriceInr, rng);
        double flipkartPrice = simulatePrice(basePriceInr, rng);

        // ------------------------------------------------------------------
        // Step 4: Build retailer price list
        // ------------------------------------------------------------------
        // RetailerPrice constructor: (retailer, price, url, lastUpdated)
        // We don't have real product URLs from DummyJSON, so we build
        // plausible search URLs for each retailer using the product title.
        String encodedTitle = dp.getTitle().replace(" ", "+");
        String today = LocalDate.now().toString(); // e.g. "2026-04-06"

        List<RetailerPrice> prices = List.of(
            new RetailerPrice(
                "Amazon",
                amazonPrice,
                "https://www.amazon.in/s?k=" + encodedTitle,
                today   // lastUpdated = today's date
            ),
            new RetailerPrice(
                "Flipkart",
                flipkartPrice,
                "https://www.flipkart.com/search?q=" + encodedTitle,
                today   // lastUpdated = today's date
            )
        );

        // ------------------------------------------------------------------
        // Step 5: Build a simulated 6-month price history
        // ------------------------------------------------------------------
        // The chart on the product detail page expects priceHistory to be
        // populated. We generate 6 monthly data points with small random
        // fluctuations around the base price so the chart looks realistic.
        List<PricePoint> priceHistory = buildPriceHistory(basePriceInr, rng);

        // ------------------------------------------------------------------
        // Step 6: Assemble and return the Product document
        // ------------------------------------------------------------------
        // Using setters instead of the all-args constructor because Product
        // now has more fields than the original constructor was written for.
        Product product = new Product();

        product.setName(dp.getTitle());             // DummyJSON "title" → our "name"
        product.setCategory(dp.getCategory());       // pass category through directly
        product.setBrand(dp.getBrand());             // pass brand through directly
        product.setDescription(dp.getDescription()); // pass description through
        product.setImageUrl(dp.getThumbnail());      // use thumbnail as image URL
        product.setPrices(prices);                   // Amazon + Flipkart prices (INR)
        product.setPriceHistory(priceHistory);       // 6-month simulated history (INR)
        product.setBasePrice(basePriceInr);          // INR base price
        product.setSearchQuery(query);               // cache key (normalized query)
        product.setCachedAt(Instant.now());          // cache timestamp (UTC)

        // Note: we do NOT call product.setId() — MongoDB auto-generates _id
        // when ProductService calls productRepository.saveAll(results)

        return product;
    }

    /**
     * Simulates a retailer price by applying a random ±5–15% variation
     * to the base price.
     *
     * Formula:
     *   variationFactor = random value between 0.05 and 0.15
     *   direction        = +1 (more expensive) or -1 (cheaper)
     *   retailerPrice    = basePrice * (1 + direction * variationFactor)
     *
     * Result is rounded to 2 decimal places.
     *
     * @param basePrice the INR base price to vary from
     * @param rng       seeded Random so results are stable per product
     * @return simulated retailer price in INR
     */
    private double simulatePrice(double basePrice, Random rng) {
        // Random factor between 5% (0.05) and 15% (0.15)
        double variationFactor = 0.05 + rng.nextDouble() * 0.10;

        // Randomly add or subtract the variation
        int direction = rng.nextBoolean() ? 1 : -1;

        double simulatedPrice = basePrice * (1 + direction * variationFactor);

        // Round to 2 decimal places
        return Math.round(simulatedPrice * 100.0) / 100.0;
    }

    /**
     * Builds a simulated 6-month price history for the product detail chart.
     *
     * Generates one PricePoint per month going back 6 months from today.
     * Each point fluctuates ±3–8% around the base price to look natural.
     *
     * @param basePrice the INR base price to fluctuate around
     * @param rng       seeded Random for stable results per product
     * @return list of 6 PricePoint objects ordered oldest → newest
     */
    private List<PricePoint> buildPriceHistory(double basePrice, Random rng) {
        List<PricePoint> history = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
            // Calculate the date for this history point
            LocalDate date = today.minusMonths(monthsAgo);

            // ±3–8% fluctuation — subtler than the retailer variation
            double fluctuation = 0.03 + rng.nextDouble() * 0.05;
            int direction = rng.nextBoolean() ? 1 : -1;
            double historicalPrice = Math.round(
                basePrice * (1 + direction * fluctuation) * 100.0) / 100.0;

            // PricePoint constructor: (date String, price double)
            // Format: "YYYY-MM-DD" — matches your existing priceHistory shape
            history.add(new PricePoint(date.toString(), historicalPrice));
        }

        return history;
    }
}