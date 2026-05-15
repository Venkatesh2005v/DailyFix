package com.example.dailyfix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AiFallbackService {

    private static final Logger log = LoggerFactory.getLogger(AiFallbackService.class);

    @Value("${gemini.api.key}") private String geminiKey;
    @Value("${groq.api.key}")   private String groqKey;
    @Value("${mistral.api.key}") private String mistralKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Track which providers are cooling down
    private final Map<String, Instant> cooldowns = new ConcurrentHashMap<>();
    private static final Duration COOLDOWN = Duration.ofMinutes(5);

    private record AiProvider(String name, String url, String model,
                              String apiKey, ProviderType type) {}

    private enum ProviderType { GEMINI, GROQ, MISTRAL }

    private List<AiProvider> getActiveProviders() {
        List<AiProvider> all = List.of(
                new AiProvider("gemini-flash",
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiKey,
                        "gemini-2.0-flash", geminiKey, ProviderType.GEMINI),

                new AiProvider("gemini-flash-lite",
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" + geminiKey,
                        "gemini-2.0-flash-lite", geminiKey, ProviderType.GEMINI),

                new AiProvider("groq-llama",
                        "https://api.groq.com/openai/v1/chat/completions",
                        "llama-3.3-70b-versatile", groqKey, ProviderType.GROQ),

                new AiProvider("groq-mixtral",
                        "https://api.groq.com/openai/v1/chat/completions",
                        "mixtral-8x7b-32768", groqKey, ProviderType.GROQ),

                new AiProvider("mistral",
                        "https://api.mistral.ai/v1/chat/completions",
                        "mistral-small-latest", mistralKey, ProviderType.MISTRAL)
        );

        // Filter out cooling-down providers
        return all.stream()
                .filter(p -> {
                    Instant cooldownUntil = cooldowns.get(p.name());
                    return cooldownUntil == null || Instant.now().isAfter(cooldownUntil);
                })
                .collect(Collectors.toList());
    }

    public String analyze(String prompt) {
        List<AiProvider> providers = getActiveProviders();

        if (providers.isEmpty()) {
            log.error("All AI providers are in cooldown");
            return "AI analysis temporarily unavailable.";
        }

        for (AiProvider provider : providers) {
            try {
                String result = callProvider(provider, prompt);
                log.info("Success via {}", provider.name());
                return result;
            } catch (HttpClientErrorException e) {
                if (isRateLimit(e)) {
                    log.warn("{} rate limited — cooling down {}m", provider.name(), COOLDOWN.toMinutes());
                    cooldowns.put(provider.name(), Instant.now().plus(COOLDOWN));
                } else {
                    log.error("{} error: {}", provider.name(), e.getMessage());
                }
            } catch (Exception e) {
                log.error("{} failed: {}", provider.name(), e.getMessage());
            }
        }

        return "AI analysis temporarily unavailable.";
    }

    private boolean isRateLimit(HttpClientErrorException e) {
        return e.getStatusCode().value() == 429 ||
                e.getResponseBodyAsString().contains("quota") ||
                e.getResponseBodyAsString().contains("rate");
    }

    private String callProvider(AiProvider provider, String prompt) {
        return switch (provider.type()) {
            case GEMINI  -> callGemini(provider, prompt);
            case GROQ    -> callOpenAiStyle(provider, prompt);
            case MISTRAL -> callOpenAiStyle(provider, prompt);
        };
    }

    private String callGemini(AiProvider provider, String prompt) {
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );
        ResponseEntity<Map> response = restTemplate.postForEntity(provider.url(),
                new HttpEntity<>(body, jsonHeaders(null)), Map.class);
        return extractGemini(response.getBody());
    }

    private String callOpenAiStyle(AiProvider provider, String prompt) {
        Map<String, Object> body = Map.of(
                "model", provider.model(),
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        ResponseEntity<Map> response = restTemplate.postForEntity(provider.url(),
                new HttpEntity<>(body, jsonHeaders("Bearer " + provider.apiKey())), Map.class);
        return extractOpenAiStyle(response.getBody());
    }

    private HttpHeaders jsonHeaders(String auth) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        if (auth != null) h.set("Authorization", auth);
        return h;
    }

    @SuppressWarnings("unchecked")
    private String extractGemini(Map body) {
        List<Map> candidates = (List<Map>) body.get("candidates");
        Map content = (Map) candidates.get(0).get("content");
        List<Map> parts = (List<Map>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    @SuppressWarnings("unchecked")
    private String extractOpenAiStyle(Map body) {
        List<Map> choices = (List<Map>) body.get("choices");
        Map message = (Map) choices.get(0).get("message");
        return (String) message.get("content");
    }
}

