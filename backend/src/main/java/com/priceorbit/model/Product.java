package com.priceorbit.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;
    private String category;
    private String brand;
    private String description;
    private String imageUrl;

    // List of prices from different retailers (Amazon, Flipkart)
    private List<RetailerPrice> prices;

    // 6-month price history — each PricePoint has { date, price }
    private List<PricePoint> priceHistory;
}