package com.nexaa.controller;

import com.nexaa.dto.SignInRequest;
import com.nexaa.dto.SignUpRequest;
import com.nexaa.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody SignInRequest signInRequest) {
        return authService.signIn(signInRequest);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        return authService.signUp(signUpRequest);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        return authService.validateToken(token);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body(new com.nexaa.dto.MessageResponse("Auth service is running!"));
    }
}