package com.realestate.service;

import com.realestate.dto.ChatRequest;
import com.realestate.dto.ChatResponse;
import com.realestate.dto.PropertyDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final PropertyService propertyService;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public ChatResponse processChat(ChatRequest chatRequest) {
        // Fetch properties context
        List<PropertyDto.Response> properties = propertyService.getAllProperties();
        
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("Here is the list of available properties in the database:\n");
        for (PropertyDto.Response p : properties) {
            if (p.getStatus() == null || p.getStatus().name().equals("AVAILABLE")) {
                contextBuilder.append(String.format("- [%s] %s in %s (Price: %s). Description: %s\n", 
                        p.getPropertyType(), p.getTitle(), p.getCity(), p.getPrice(), p.getDescription()));
            }
        }

        String systemPrompt = String.format(
            "You are an intelligent real estate recommendation assistant named \"RE Bot\".\n" +
            "Your task is to suggest apartments or lands based on user input.\n\n" +
            "Rules:\n" +
            "1. The user may provide a price (e.g., '5 million', '10M'), a place name (e.g., 'Colombo', 'Kandy'), or both.\n" +
            "2. If a price is given: Suggest properties within a similar price range (±10–20%%), including nearby or comparable options.\n" +
            "3. If a location is given: Suggest properties in nearby areas or similar locations.\n" +
            "4. If both price and location are given: Prioritize results that match BOTH conditions.\n" +
            "5. If the user asks for 'luxury' properties, prioritize properties with pool, gym, parking or a higher price point.\n" +
            "6. If the user asks for 'semi luxury', prioritize mid-range properties.\n" +
            "7. If the user asks for 'budget', prioritize lower-priced, affordable properties.\n" +
            "8. If the user specifies 'land' or 'apartment', exclusively filter and suggest that specific property type.\n" +
            "9. Output must include: Property type (Land / Apartment), Location, Estimated price, and Short description.\n" +
            "10. Keep responses short, clear, and realistic.\n" +
            "11. DO NOT greet the user (e.g., do not say 'Hello', 'Good morning'). The user has already been greeted. Just directly answer the query.\n" +
            "12. Always return 2–5 relevant suggestions, if the database has that many examples.\n\n" +
            "Example Output:\n" +
            "- Apartment | Colombo 5 | LKR 9.5M | 2 bedrooms, close to main road\n" +
            "- Land | Dehiwala | LKR 10.2M | Newly built, near beach\n\n" +
            "Properties database:\n" +
            "%s\n\n" +
            "User Message: %s", contextBuilder.toString(), chatRequest.getMessage());

        String geminiEndpoint = geminiApiUrl + "?key=" + geminiApiKey;

        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", systemPrompt)
                ))
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(geminiEndpoint, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        String reply = (String) parts.get(0).get("text");
                        return new ChatResponse(reply);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
                org.springframework.web.client.HttpStatusCodeException httpException = (org.springframework.web.client.HttpStatusCodeException) e;
                if (httpException.getStatusCode().value() == 503) {
                    return new ChatResponse("I am currently experiencing high demand. Please try again in a few moments.");
                }
            }
            return new ChatResponse("I am having technical difficulties right now and cannot process your request. Please try again later.");
        }

        return new ChatResponse("I could not generate a response. Please try again.");
    }

}
