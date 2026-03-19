package com.priceorbit.controller;

import com.priceorbit.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// ✅ @RestController means this class handles HTTP requests and returns JSON responses
@RestController
// ✅ All endpoints in this class start with /api/auth
// e.g. /api/auth/register and /api/auth/login
@RequestMapping("/api/auth")
// ✅ @CrossOrigin allows our React frontend (localhost:3000) to call these endpoints
@CrossOrigin(origins = "http://localhost:3000")
// ✅ @RequiredArgsConstructor auto-injects AuthService for us
@RequiredArgsConstructor
public class AuthController {

    // ✅ AuthService contains all the register/login business logic
    private final AuthService authService;

    // -----------------------------------------------------------------------
    // POST /api/auth/register
    // Frontend sends: { "name": "Mohamed", "email": "...", "password": "..." }
    // Backend returns: { "token": "...", "name": "...", "email": "...", "id": "..." }
    // -----------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            // ✅ Extract name, email, password from the request body JSON
            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");

            // ✅ Basic validation — make sure none of the fields are empty
            if (name == null || name.isBlank() ||
                email == null || email.isBlank() ||
                password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Name, email and password are required."));
            }

            // ✅ Call AuthService to create the user and get back a JWT token
            Map<String, String> response = authService.register(name, email, password);

            // ✅ Return 200 OK with token and user info
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // ✅ If email already exists, AuthService throws a RuntimeException
            // We catch it here and return a 400 Bad Request with the error message
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/auth/login
    // Frontend sends: { "email": "...", "password": "..." }
    // Backend returns: { "token": "...", "name": "...", "email": "...", "id": "..." }
    // -----------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            // ✅ Extract email and password from the request body JSON
            String email = request.get("email");
            String password = request.get("password");

            // ✅ Basic validation
            if (email == null || email.isBlank() ||
                password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and password are required."));
            }

            // ✅ Call AuthService to verify credentials and get back a JWT token
            Map<String, String> response = authService.login(email, password);

            // ✅ Return 200 OK with token and user info
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // ✅ If email not found or password wrong, AuthService throws RuntimeException
            // Return 401 Unauthorized with the error message
            return ResponseEntity.status(401)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}