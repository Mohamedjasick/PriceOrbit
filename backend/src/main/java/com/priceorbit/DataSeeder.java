package com.priceorbit;

import com.priceorbit.model.PricePoint;
import com.priceorbit.model.Product;
import com.priceorbit.model.RetailerPrice;
import com.priceorbit.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (productRepository.count() == 0) {
            productRepository.saveAll(getSeedProducts());
            System.out.println("✅ Seeded 12 products into MongoDB.");
        } else {
            System.out.println("ℹ️ Database already has products. Skipping seed.");
        }
    }

    private List<Product> getSeedProducts() {
        return Arrays.asList(

            // ──────────────── LAPTOPS ────────────────

            new Product(
                "prod_001",
                "Apple MacBook Air M2",
                "Laptops",
                "Apple",
                "13.6-inch Liquid Retina display, Apple M2 chip, 8GB RAM, 256GB SSD. Fanless design, all-day battery life.",
                "https://m.media-amazon.com/images/I/71f5ExHnqAL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 99900.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 97999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{115000, 112000, 108000, 104000, 99900, 97999})
            ),

            new Product(
                "prod_002",
                "Dell XPS 15",
                "Laptops",
                "Dell",
                "15.6-inch OLED display, Intel Core i7-13700H, 16GB RAM, 512GB SSD. Premium build for creators.",
                "https://m.media-amazon.com/images/I/71wkKLqR2OL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 149999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 152999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{165000, 160000, 158000, 155000, 152000, 149999})
            ),

            new Product(
                "prod_003",
                "Lenovo ThinkPad X1 Carbon",
                "Laptops",
                "Lenovo",
                "14-inch IPS display, Intel Core i5-1335U, 16GB RAM, 512GB SSD. MIL-SPEC toughness, ultralight at 1.12kg.",
                "https://m.media-amazon.com/images/I/71QY6vZ0yQL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 134999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 132500.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{148000, 145000, 142000, 138000, 135000, 132500})
            ),

            // ──────────────── PHONES ────────────────

            new Product(
                "prod_004",
                "Samsung Galaxy S24 Ultra",
                "Phones",
                "Samsung",
                "6.8-inch QHD+ Dynamic AMOLED, Snapdragon 8 Gen 3, 12GB RAM, 256GB, 200MP camera, built-in S Pen.",
                "https://m.media-amazon.com/images/I/71Sa3dqTqzL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 129999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 127499.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{144999, 140000, 137000, 134000, 130000, 127499})
            ),

            new Product(
                "prod_005",
                "Apple iPhone 15 Pro",
                "Phones",
                "Apple",
                "6.1-inch Super Retina XDR, A17 Pro chip, 48MP main camera, titanium design, USB-C.",
                "https://m.media-amazon.com/images/I/81cwlcVBXlL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 134900.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 133999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{149900, 145000, 141000, 138000, 135000, 133999})
            ),

            new Product(
                "prod_006",
                "OnePlus 12",
                "Phones",
                "OnePlus",
                "6.82-inch LTPO AMOLED, Snapdragon 8 Gen 3, 12GB RAM, 256GB, 50MP Hasselblad camera.",
                "https://m.media-amazon.com/images/I/71bNXJ5VgGL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 64999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 62999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{74999, 72000, 70000, 67000, 65000, 62999})
            ),

            // ──────────────── AUDIO ────────────────

            new Product(
                "prod_007",
                "Sony WH-1000XM5",
                "Audio",
                "Sony",
                "Industry-leading noise cancellation, 30-hour battery, multipoint connection, speak-to-chat feature.",
                "https://m.media-amazon.com/images/I/61bpCiMDqgL._AC_SL1000_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 29990.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 28999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{34990, 33500, 32000, 31000, 29990, 28999})
            ),

            new Product(
                "prod_008",
                "Apple AirPods Pro 2nd Gen",
                "Audio",
                "Apple",
                "Active Noise Cancellation, Adaptive Transparency, Spatial Audio, MagSafe charging case.",
                "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 24900.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 24499.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{29900, 28500, 27000, 26000, 25000, 24499})
            ),

            new Product(
                "prod_009",
                "Bose QuietComfort 45",
                "Audio",
                "Bose",
                "World-class Bose noise cancellation, 24-hour battery, Aware Mode, lightweight foldable design.",
                "https://m.media-amazon.com/images/I/51iFxCVo1gL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 26990.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 25999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{32990, 31000, 29500, 28000, 27000, 25999})
            ),

            // ──────────────── TVS ────────────────

            new Product(
                "prod_010",
                "LG C3 OLED 55-inch",
                "TVs",
                "LG",
                "55-inch 4K OLED evo panel, α9 AI Processor Gen6, Dolby Vision IQ, HDMI 2.1, webOS 23.",
                "https://m.media-amazon.com/images/I/81QXgWbj0mL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 139999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 136999.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{159999, 155000, 150000, 145000, 140000, 136999})
            ),

            new Product(
                "prod_011",
                "Samsung 65-inch Neo QLED 4K",
                "TVs",
                "Samsung",
                "65-inch Neo QLED 4K, Quantum Matrix Technology, Object Tracking Sound, 120Hz, Tizen OS.",
                "https://m.media-amazon.com/images/I/81D9lCxvfCL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 119999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 117499.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{135000, 130000, 127000, 124000, 121000, 117499})
            ),

            new Product(
                "prod_012",
                "Sony Bravia XR 55-inch OLED",
                "TVs",
                "Sony",
                "55-inch 4K OLED, XR Cognitive Processor, Acoustic Surface Audio+, BRAVIA CORE, Google TV.",
                "https://m.media-amazon.com/images/I/71f9jKdMYAL._AC_SL1500_.jpg",
                Arrays.asList(
                    new RetailerPrice("Amazon", 159999.0, "https://amazon.in", "2024-06-01"),
                    new RetailerPrice("Flipkart", 157499.0, "https://flipkart.com", "2024-06-01")
                ),
                makePriceHistory(new double[]{179999, 175000, 170000, 165000, 162000, 157499})
            )
        );
    }

    /**
     * Helper method to generate 6-month price history.
     * Provide an array of 6 prices (oldest to newest).
     * Months are labelled Jan–Jun 2024.
     */
    private List<PricePoint> makePriceHistory(double[] prices) {
        String[] months = {"Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024"};
        PricePoint[] history = new PricePoint[6];
        for (int i = 0; i < 6; i++) {
            history[i] = new PricePoint(months[i], prices[i]);
        }
        return Arrays.asList(history);
    }
}