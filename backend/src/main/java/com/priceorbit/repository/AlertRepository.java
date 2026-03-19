package com.priceorbit.repository;

import com.priceorbit.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AlertRepository.java — MongoDB data access layer for alerts.
 *
 * Extends MongoRepository which gives us free CRUD methods:
 *   save(), findById(), findAll(), deleteById(), etc.
 *
 * We add custom query methods using Spring Data's method naming convention.
 * Spring reads the method name and auto-generates the MongoDB query.
 * No SQL or manual queries needed — Spring handles it all.
 */
@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    /**
     * Find all alerts belonging to a specific user.
     * Spring translates this to: db.alerts.find({ userId: userId })
     */
    List<Alert> findByUserId(String userId);

    /**
     * Find all alerts for a user that haven't been triggered yet.
     * Used when checking if any alert should now fire.
     * Spring translates to: db.alerts.find({ userId: userId, triggered: false })
     */
    List<Alert> findByUserIdAndTriggered(String userId, boolean triggered);

    /**
     * Find ALL untriggered alerts across all users.
     * Used by the alert-checking service to scan everything at once.
     * Spring translates to: db.alerts.find({ triggered: false })
     */
    List<Alert> findByTriggered(boolean triggered);

    /**
     * Check if an alert already exists for this user + product combination.
     * Prevents duplicate alerts for the same product.
     * Spring translates to: db.alerts.find({ userId: ..., productId: ... })
     */
    List<Alert> findByUserIdAndProductId(String userId, String productId);
}
