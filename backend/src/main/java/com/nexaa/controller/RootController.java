package com.nexaa.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/")
public class RootController {

    @GetMapping
    public ResponseEntity<?> root() {
        return ResponseEntity.ok().body(new com.nexaa.dto.MessageResponse("🚀 Welcome to Nexaa Backend API! Server is running."));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body(new com.nexaa.dto.MessageResponse("✅ Nexaa Backend is healthy and ready to serve!"));
    }
}