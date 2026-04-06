package com.priceorbit.repository;

import com.priceorbit.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'category': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Product> searchByNameOrCategory(String keyword);

    List<Product> findByCategory(String category);

    /**
     * Cache lookup method — finds all Product documents where the
     * searchQuery field exactly matches the given normalized query string.
     *
     * Spring Data MongoDB automatically implements this method from its name:
     *   findBy       → SELECT WHERE
     *   SearchQuery  → the `searchQuery` field on Product
     *
     * Example: findBySearchQuery("iphone")
     * → returns all MongoDB documents where searchQuery == "iphone"
     *
     * This is how ProductService checks if a query result is already cached
     * before deciding whether to call DummyJSON or not.
     */
    List<Product> findBySearchQuery(String searchQuery);
}