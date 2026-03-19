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
}