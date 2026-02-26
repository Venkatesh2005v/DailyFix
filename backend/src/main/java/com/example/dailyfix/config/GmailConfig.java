package com.example.dailyfix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GmailConfig {

    @Bean
    public com.google.api.services.gmail.Gmail gmailService(
            org.springframework.security.oauth2.client.OAuth2AuthorizedClientService clientService) {

        return new com.google.api.services.gmail.Gmail.Builder(
                new com.google.api.client.http.javanet.NetHttpTransport(),
                new com.google.api.client.json.gson.GsonFactory(),
                null
        ).setApplicationName("DailyFix").build();
    }
}
