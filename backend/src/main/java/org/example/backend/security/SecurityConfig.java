package org.example.backend.security;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;

@Configuration
@AllArgsConstructor
public class SecurityConfig {

    private final JwtConfig jwtConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
                    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
                    return config;
                }))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Públicos: login, registro, puestos públicos
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/empresa/registro").permitAll()
                        .requestMatchers("/api/oferente/registro").permitAll()
                        .requestMatchers("/api/puestos/ultimos").permitAll()
                        .requestMatchers("/api/oferente/registro").permitAll()
                        .requestMatchers("/api/oferente/cv/**").permitAll()  // empresas también ven CVs
                        .requestMatchers(    "/api/caracteristicas/raices").permitAll()
                        .requestMatchers("/api/puestos/buscar-por-caracteristicas").permitAll()
                        .requestMatchers("/api/puestos/{id}").permitAll()
                        // Protegidos por rol
                        .requestMatchers("/api/admin/**").hasAuthority("SCOPE_ADM")
                        .requestMatchers("/api/empresa/**").hasAnyAuthority("SCOPE_EMP", "SCOPE_ADM")
                        .requestMatchers("/api/oferente/**").hasAnyAuthority("SCOPE_OFE", "SCOPE_ADM")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(configurer -> configurer.jwt(Customizer.withDefaults()))
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(jwtConfig.getSecretKey()).build();
    }
}