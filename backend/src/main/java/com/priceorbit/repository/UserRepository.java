package com.priceorbit.repository;

import com.priceorbit.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// ✅ @Repository marks this as a database access layer component
// Spring Boot will automatically implement all the database methods for us
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // ✅ This method lets us find a user by their email address
    // Spring Boot automatically generates the SQL/MongoDB query just from the method name
    // Returns Optional<User> meaning it might return a user or might return empty (not found)
    Optional<User> findByEmail(String email);

    // ✅ This method checks if an email already exists in the database
    // Used during registration to prevent duplicate accounts
    boolean existsByEmail(String email);
}