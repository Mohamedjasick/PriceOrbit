package com.priceorbit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.priceorbit.model.Product;
import com.priceorbit.model.RetailerPrice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class PriceScoutService {

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    @Value("${pricescout.host}")
    private String rapidApiHost;

    private static final String PRICESCOUT_URL = "https://pricescout.p.rapidapi.com/search";

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Live product search via RapidAPI PriceScout.
     *
     * ⏸️ TEMPORARILY DISABLED — RapidAPI quota exhausted.
     * All searches fall back to MongoDB instantly instead.
     * To re-enable live search: delete the "return List.of();" line below and redeploy.
     *
     * @param searchTerm the user's search query
     * @return empty list (triggers MongoDB fallback in the caller)
     */
    public List<Product> search(String searchTerm) {
        // ⏸️ Disabled until RapidAPI quota resets — MongoDB fallback handles everything.
        return List.of();

        // ── Everything below is preserved and ready to re-enable ──────────────────

        /*
        if (rapidApiKey == null || rapidApiKey.isBlank()) {
            System.out.println("[PriceScout] API key not configured — skipping live search.");
            return List.of();
        }

        try {
            String requestBody = String.format(
                "{\"query\": \"%s\", \"limit\": 10}",
                searchTerm.replace("\"", "\\\"")
            );

            // 5-second connect timeout — prevents hanging when API is slow
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

            // 5-second request timeout — falls back to MongoDB quickly
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PRICESCOUT_URL))
                .header("Content-Type", "application/json")
                .header("x-rapidapi-key", rapidApiKey)
                .header("x-rapidapi-host", rapidApiHost)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(5))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.out.println("[PriceScout] Non-200 response: " + response.statusCode());
                return List.of();
            }

            return parseResponse(response.body());

        } catch (Exception e) {
            // Catches timeouts, network errors, quota errors — all fall back to MongoDB
            System.out.println("[PriceScout] Error during live search: " + e.getMessage());
            return List.of();
        }
        */
    }

    /**
     * Parses the RapidAPI JSON response into a list of Product objects.
     * Only keeps Amazon and Flipkart offers — ignores all other retailers.
     *
     * @param json raw JSON string from PriceScout API
     * @return list of parsed Product objects
     */
    private List<Product> parseResponse(String json) {
        List<Product> products = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(json);

            JsonNode results = root.isArray() ? root : root.path("results");

            if (results.isMissingNode() || !results.isArray()) {
                System.out.println("[PriceScout] Unexpected response structure.");
                return products;
            }

            for (JsonNode item : results) {
                Product product = new Product();

                product.setName(item.path("name").asText("Unknown Product"));
                product.setImageUrl(item.path("image").asText(""));
                product.setCategory("Search");
                product.setPriceHistory(new ArrayList<>());

                List<RetailerPrice> retailerPrices = new ArrayList<>();

                JsonNode offers = item.path("offers");
                if (offers.isMissingNode() || !offers.isArray()) {
                    offers = item.path("prices");
                }

                if (offers.isArray()) {
                    for (JsonNode offer : offers) {
                        String retailer = offer.path("store").asText("");

                        // Only keep Amazon and Flipkart — skip all other stores
                        if (!retailer.toLowerCase().contains("amazon") &&
                            !retailer.toLowerCase().contains("flipkart")) {
                            continue;
                        }

                        double price = offer.path("price").asDouble(0);
                        String url   = offer.path("url").asText("#");

                        RetailerPrice rp = new RetailerPrice();
                        rp.setRetailer(retailer);
                        rp.setPrice(price);
                        rp.setUrl(url);
                        retailerPrices.add(rp);
                    }
                }

                // Skip products with no valid retailer prices
                if (retailerPrices.isEmpty()) continue;

                product.setPrices(retailerPrices);
                products.add(product);
            }

        } catch (Exception e) {
            System.out.println("[PriceScout] Failed to parse response: " + e.getMessage());
        }

        return products;
    }
}