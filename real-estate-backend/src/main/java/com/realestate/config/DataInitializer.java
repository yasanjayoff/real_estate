package com.realestate.config;

import com.realestate.entity.User;
import com.realestate.enums.Role;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@realestate.com")) {
            User admin = User.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@realestate.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("0700000000")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin user created: admin@realestate.com / Admin@123");
        }
    }
}
