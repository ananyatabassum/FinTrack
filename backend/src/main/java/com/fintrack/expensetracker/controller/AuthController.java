package com.fintrack.expensetracker.controller;

import com.fintrack.expensetracker.dto.AuthResponse;
import com.fintrack.expensetracker.dto.LoginRequest;
import com.fintrack.expensetracker.dto.RegisterRequest;
import com.fintrack.expensetracker.dto.UserDto;
import com.fintrack.expensetracker.security.UserPrincipal;
import com.fintrack.expensetracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/demo")
    public ResponseEntity<AuthResponse> demoLogin() {
        return ResponseEntity.ok(authService.demoLogin());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getId()));
    }
}
