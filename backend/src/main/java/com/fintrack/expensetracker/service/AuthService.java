package com.fintrack.expensetracker.service;

import com.fintrack.expensetracker.dto.AuthResponse;
import com.fintrack.expensetracker.dto.LoginRequest;
import com.fintrack.expensetracker.dto.RegisterRequest;
import com.fintrack.expensetracker.dto.UserDto;
import com.fintrack.expensetracker.entity.User;
import com.fintrack.expensetracker.exception.DuplicateResourceException;
import com.fintrack.expensetracker.exception.ResourceNotFoundException;
import com.fintrack.expensetracker.repository.UserRepository;
import com.fintrack.expensetracker.security.JwtService;
import com.fintrack.expensetracker.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    public static final String DEMO_EMAIL = "demo@fintrack.app";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CategoryService categoryService;
    private final DemoDataService demoDataService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        User savedUser = userRepository.save(user);
        categoryService.seedDefaultCategoriesForUser(savedUser);

        UserPrincipal principal = new UserPrincipal(savedUser);
        String token = jwtService.generateToken(principal);
        return buildAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = getUserById(principal.getId());
        String token = jwtService.generateToken(principal);
        return buildAuthResponse(user, token);
    }

    public AuthResponse demoLogin() {
        User demoUser = demoDataService.ensureDemoUserSeeded();
        UserPrincipal principal = new UserPrincipal(demoUser);
        String token = jwtService.generateToken(principal);
        return buildAuthResponse(demoUser, token);
    }

    public UserDto getCurrentUser(Long userId) {
        User user = getUserById(userId);
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserDto.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}
