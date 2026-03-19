package com.priceorbit.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetailerPrice {

    private String retailer;    // e.g. "Amazon"
    private double price;       // e.g. 99900.0
    private String url;         // e.g. "https://amazon.in"
    private String lastUpdated; // e.g. "2024-06-01"
}