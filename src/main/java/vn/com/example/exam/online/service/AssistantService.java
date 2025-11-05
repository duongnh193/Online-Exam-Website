package vn.com.example.exam.online.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import vn.com.example.exam.online.model.request.AssistantChatRequest;
import vn.com.example.exam.online.model.response.AssistantChatResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssistantService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash-latest}")
    private String geminiModel;

    @Value("${gemini.temperature:0.6}")
    private double temperature;

    @Value("${gemini.max-output-tokens:512}")
    private int maxTokens;

    public AssistantChatResponse generateResponse(AssistantChatRequest request) {
        if (request == null || request.getMessages() == null || request.getMessages().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conversation messages must not be empty");
        }

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Skipping remote generation.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini API key is not configured on the server");
        }

        List<Map<String, Object>> contentParts = request.getMessages()
                .stream()
                .filter(Objects::nonNull)
                .map(message -> {
                    String role = sanitizeRole(message.getRole());
                    String content = message.getContent();
                    Map<String, Object> part = Map.of("text", content);
                    Map<String, Object> contentNode = new HashMap<>();
                    contentNode.put("role", role);
                    contentNode.put("parts", List.of(part));
                    return contentNode;
                })
                .collect(Collectors.toList());

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contentParts);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("maxOutputTokens", maxTokens);
        payload.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("x-goog-api-key", geminiApiKey);

        String endpoint = String.format("%s/%s:generateContent", geminiApiUrl, geminiModel);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<JsonNode> responseEntity = restTemplate.postForEntity(endpoint, entity, JsonNode.class);
            JsonNode body = responseEntity.getBody();

            if (body == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from Gemini");
            }

            JsonNode candidates = body.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini did not return any candidate response");
            }

            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.path("content");
            JsonNode partsNode = content.path("parts");
            if (!partsNode.isArray() || partsNode.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini response did not contain any parts");
            }

            StringBuilder answerBuilder = new StringBuilder();
            for (JsonNode part : partsNode) {
                String text = part.path("text").asText("");
                if (!text.isBlank()) {
                    answerBuilder.append(text);
                }
            }

            String answer = answerBuilder.toString().trim();

            if (answer.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned empty content");
            }

            Map<String, Object> usage = null;
            if (body.has("usageMetadata") && !body.get("usageMetadata").isNull()) {
                usage = objectMapper.convertValue(body.get("usageMetadata"), new TypeReference<>() {});
            }

            return AssistantChatResponse.builder()
                    .answer(answer)
                    .provider("gemini")
                    .model(geminiModel)
                    .usage(usage)
                    .build();
        } catch (HttpStatusCodeException ex) {
            String errorBody = ex.getResponseBodyAsString();
            log.error("Gemini API call failed: status={}, body={}", ex.getStatusCode(), errorBody);

            String message = "Failed to contact Gemini service";
            try {
                if (errorBody != null && !errorBody.isBlank()) {
                    JsonNode errorNode = objectMapper.readTree(errorBody);
                    String geminiMessage = errorNode.path("error").path("message").asText(null);
                    if (geminiMessage != null && !geminiMessage.isBlank()) {
                        message = geminiMessage;
                    }
                }
            } catch (Exception parsingException) {
                log.warn("Could not parse Gemini error response", parsingException);
            }

            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message, ex);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while calling Gemini", ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error while contacting Gemini", ex);
        }
    }

    private String sanitizeRole(String role) {
        if (role == null) {
            return "user";
        }
        String normalized = role.trim().toLowerCase();
        switch (normalized) {
            case "assistant":
            case "model":
                return "model";
            case "system":
                return "user";
            default:
                return "user";
        }
    }
}
