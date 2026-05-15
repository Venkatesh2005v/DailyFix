package com.example.dailyfix.config;

import com.example.dailyfix.jwt.JwtFilter;
import com.example.dailyfix.oauth2.OAuth2SuccessHandler;
import com.example.dailyfix.service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired private JwtFilter jwtFilter;
    @Autowired private OAuth2SuccessHandler successHandler;

    private static final Logger log =
            LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(
            JdbcOperations jdbcOperations,
            ClientRegistrationRepository repo) {
        return new JdbcOAuth2AuthorizedClientService(jdbcOperations, repo) {
            @Override
            public void saveAuthorizedClient(OAuth2AuthorizedClient client,
                                             Authentication principal) {
                log.info("SAVING token for principal: {}", principal.getName());
                log.info("Scopes: {}", client.getAccessToken().getScopes());
                super.saveAuthorizedClient(client, principal);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/error",
                                "/login/**",
                                "/oauth2/**",
                                "/api/public/**",
                                "/api/health"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth.successHandler(successHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://daily-fix-six.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false); // JWT = no cookies
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}