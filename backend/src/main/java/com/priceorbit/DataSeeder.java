package com.priceorbit;

import com.priceorbit.model.Product;
import com.priceorbit.repository.ProductRepository;
import com.priceorbit.service.DummyJsonService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataSeeder now pre-warms the MongoDB cache on startup by fetching
 * products for popular categories from DummyJSON.
 *
 * This ensures the Categories section and Deals page are populated
 * immediately when the app loads — no manual searching needed.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final DummyJsonService dummyJsonService;

    // These are the EXACT query terms DummyJSON recognizes
   private static final List<String> PREWARM_QUERIES = List.of(
    "laptop",
    "smartphone",
    "chair",        // furniture
    "juice",        // groceries
    "essence",        // beauty + skin-care
    "watch",
    "shirt",
    "sneakers",     // mens-shoes + womens-shoes
    "handbag",      // womens-bags
    "sunglasses",
    "motorcycle"
);

    public DataSeeder(ProductRepository productRepository,
                      DummyJsonService dummyJsonService) {
        this.productRepository = productRepository;
        this.dummyJsonService  = dummyJsonService;
    }

    @Override
    public void run(String... args) {
        System.out.println("🔄 PriceOrbit: Pre-warming MongoDB cache from DummyJSON...");

        for (String query : PREWARM_QUERIES) {
            // Skip if already cached — avoids redundant API calls on restart
            List<Product> existing = productRepository.findBySearchQuery(query);
            if (!existing.isEmpty()) {
                System.out.println("✅ Already cached: " + query
                        + " (" + existing.size() + " products)");
                continue;
            }

            try {
    List<Product> products = dummyJsonService.fetchAndBuild(query);
    if (!products.isEmpty()) {
        productRepository.saveAll(products);
        System.out.println("💾 Cached " + products.size()
                + " products for: " + query);
    } else {
        System.out.println("⚠️ No results from DummyJSON for: " + query);
    }

    // ✅ Wait 1 second between requests to avoid DummyJSON 429 rate limit
    Thread.sleep(1000);

} catch (InterruptedException ie) {
    Thread.currentThread().interrupt();
    System.out.println("⚠️ Pre-warm interrupted.");
    break;
} catch (Exception e) {
    System.out.println("❌ Failed to pre-warm: " + query
            + " — " + e.getMessage());
    // Wait a bit longer after a failure before retrying next query
    try { Thread.sleep(2000); } catch (InterruptedException ie) { break; }
}
        }
        System.out.println("✅ PriceOrbit Backend is running at http://localhost:8080");
    }
}