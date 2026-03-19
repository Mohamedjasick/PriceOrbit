package com.priceorbit.service;

import com.priceorbit.model.User;
import com.priceorbit.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

// ✅ @Service marks this class as a business logic layer component
// This is where all the register/login logic lives
@Service
// ✅ @RequiredArgsConstructor from Lombok auto-generates a constructor
// that injects UserRepository for us — no need to write it manually
@RequiredArgsConstructor
public class AuthService {

    // ✅ UserRepository gives us access to the MongoDB users collection
    private final UserRepository userRepository;

    // ✅ BCryptPasswordEncoder is Spring Security's password hasher
    // BCrypt is a one-way hash — you can never reverse it back to plain text
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ This is the secret key used to sign JWT tokens
    // Keys.secretKeyFor generates a cryptographically safe key for HS256 algorithm
    // In production you'd store this in application.properties, but this works for portfolio
    private final Key jwtSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // ✅ How long the JWT token stays valid — 7 days in milliseconds
    private static final long JWT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000L;

    // -----------------------------------------------------------------------
    // REGISTER: creates a new user account
    // -----------------------------------------------------------------------
    public Map<String, String> register(String name, String email, String password) {

        // ✅ Check if someone already registered with this email
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered. Please sign in.");
        }

        // ✅ Hash the password before saving — NEVER store plain text passwords
        // e.g. "mypassword123" becomes "$2a$10$xyz..." in MongoDB
        String hashedPassword = passwordEncoder.encode(password);

        // ✅ Build the new User object and save to MongoDB
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(hashedPassword);

        User savedUser = userRepository.save(newUser);

        // ✅ Generate a JWT token so the user is logged in immediately after registering
        String token = generateToken(savedUser);

        // ✅ Return token + user info to the frontend
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("id", savedUser.getId());
        return response;
    }

    // -----------------------------------------------------------------------
    // LOGIN: checks credentials and returns a JWT token
    // -----------------------------------------------------------------------
    public Map<String, String> login(String email, String password) {

        // ✅ Look up the user by email — throw error if not found
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        // ✅ Compare the entered password against the hashed password in MongoDB
        // passwordEncoder.matches() hashes the input and compares — never decrypts
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        // ✅ Credentials are correct — generate and return JWT token
        String token = generateToken(user);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("id", user.getId());
        return response;
    }

    // -----------------------------------------------------------------------
    // GENERATE JWT TOKEN: creates a signed token containing user info
    // -----------------------------------------------------------------------
    private String generateToken(User user) {

        // ✅ JWT tokens have 3 parts: header, payload (claims), signature
        // Claims are the data we store inside the token
        return Jwts.builder()
                .setSubject(user.getEmail())        // who this token belongs to
                .claim("name", user.getName())       // extra data stored in token
                .claim("id", user.getId())           // user's MongoDB ID
                .setIssuedAt(new Date())             // when token was created
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRY_MS)) // expiry
                .signWith(jwtSecretKey)              // sign with our secret key
                .compact();                          // build the final token string
    }
}