package com.smartvotingss.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.ParameterizedTypeReference;

import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RecaptchaController {

    @Value("${api.recaptcha}")
    private String recaptchaSecret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    @PostMapping("/verify-recaptcha")
    public ResponseEntity<Map<String, Object>> verifyRecaptcha(@RequestBody Map<String, String> requestBody) {
        String token = requestBody.get("token");

        System.out.println("Received token: " + token);  // ✅ Print the token for debugging

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", recaptchaSecret);
        params.add("response", token);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map<String, Object>> googleResponse = restTemplate.exchange(
                VERIFY_URL,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        System.out.println("Google reCAPTCHA response: " + googleResponse.getBody());

        Map<String, Object> responseBody = new HashMap<>();
        if (googleResponse.getBody() != null && googleResponse.getBody().containsKey("success")) {
            boolean success = (boolean) googleResponse.getBody().get("success");
            responseBody.put("success", success);

            if (!success && googleResponse.getBody().containsKey("error-codes")) {
                Object errorCodes = googleResponse.getBody().get("error-codes");
                if (errorCodes instanceof List) {
                    responseBody.put("error-codes", errorCodes); // If it's already a list, use it directly
                } else if (errorCodes instanceof String) {
                    responseBody.put("error-codes", List.of(errorCodes)); // If it's a single string, convert it to a list
                } else if (errorCodes instanceof Object[]) { // if it's an array of Objects, convert it to a list of strings
                    responseBody.put("error-codes", Arrays.stream((Object[]) errorCodes).map(Object::toString).collect(Collectors.toList()));
                }


            }
        } else {
            responseBody.put("success", false);
            responseBody.put("error-codes", List.of("invalid-response")); // Or a more specific error
        }

        return ResponseEntity.ok(responseBody);
    }
}