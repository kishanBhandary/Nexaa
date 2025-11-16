package com.nexaa.service;

import com.nexaa.dto.AuthResponse;
import com.nexaa.dto.MessageResponse;
import com.nexaa.dto.SignInRequest;
import com.nexaa.dto.SignUpRequest;
import com.nexaa.model.Role;
import com.nexaa.model.User;
import com.nexaa.repository.UserRepository;
import com.nexaa.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public ResponseEntity<?> signIn(SignInRequest signInRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signInRequest.getEmail(), signInRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userRepository.findByEmail(signInRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime expiresAt = jwtUtils.getExpirationDateFromJwtToken(jwt)
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            AuthResponse authResponse = new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRoles(),
                    expiresAt
            );

            logger.info("User signed in successfully: {}", user.getEmail());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Error during sign in for email: {}", signInRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid credentials!"));
        }
    }

    public ResponseEntity<?> signUp(SignUpRequest signUpRequest) {
        try {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            // Create new user
            User user = new User(
                    signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword())
            );

            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            user.setRoles(roles);

            userRepository.save(user);

            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            logger.error("Error during user registration for email: {}", signUpRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Failed to register user!"));
        }
    }

    public ResponseEntity<?> validateToken(String token) {
        try {
            if (jwtUtils.validateJwtToken(token)) {
                String userId = jwtUtils.getUserIdFromJwtToken(token);
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(new MessageResponse("Token is valid"));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid token!"));
            }
        } catch (Exception e) {
            logger.error("Error during token validation", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Token validation failed!"));
        }
    }
}