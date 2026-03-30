package com.realestate.config;

import com.realestate.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()

                // News & Events — GET is public so email links work without login
                .requestMatchers(HttpMethod.GET, "/api/news-events/**").permitAll()

                // Properties — all authenticated users can read
                .requestMatchers(HttpMethod.GET, "/api/properties/**").authenticated()

                // Blocks/Units — all authenticated can read; write requires ADMIN (via @PreAuthorize)
                .requestMatchers(HttpMethod.GET, "/api/blocks/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/units/**").authenticated()

                // Deals — buyers can create/read/update/delete their own
                .requestMatchers(HttpMethod.GET, "/api/deals/buyer/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/deals/property/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/deals/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/deals").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/deals/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/deals/**").authenticated()

                // Visits
                .requestMatchers(HttpMethod.GET, "/api/visits/upcoming").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/visits/buyer/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/visits").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/visits/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/visits/**").authenticated()

                // Documents — rules evaluated top-to-bottom, most specific first
                // 1. File download: all authenticated users (including BUYER)
                .requestMatchers(HttpMethod.GET, "/api/documents/*/download").authenticated()
                // 2. Documents by property: all authenticated users (including BUYER)
                .requestMatchers(HttpMethod.GET, "/api/documents/property/**").authenticated()
                // 3. All other GET document endpoints: admin/agent/seller only
                .requestMatchers(HttpMethod.GET, "/api/documents/**").hasAnyRole("ADMIN", "AGENT", "SELLER")
                // 4. Write operations: admin/agent only
                .requestMatchers(HttpMethod.POST, "/api/documents/**").hasAnyRole("ADMIN", "AGENT")
                .requestMatchers(HttpMethod.PUT, "/api/documents/**").hasAnyRole("ADMIN", "AGENT")
                .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasAnyRole("ADMIN", "AGENT")

                // Users — admin only
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Blocks/Units write — admin only
                .requestMatchers("/api/blocks/**").hasRole("ADMIN")
                .requestMatchers("/api/units/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
