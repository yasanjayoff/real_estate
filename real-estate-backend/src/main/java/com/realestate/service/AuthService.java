package com.realestate.service;

import com.realestate.dto.AuthDto;
import com.realestate.entity.User;
import com.realestate.exception.BadRequestException;
import com.realestate.repository.UserRepository;
import com.realestate.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = jwtUtil.generateToken(user);
        return new AuthDto.AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole());
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(com.realestate.enums.Role.BUYER) // always BUYER on self-registration
                .active(true)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return new AuthDto.AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole());
    }
}
