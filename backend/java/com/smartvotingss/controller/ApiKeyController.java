package com.smartvotingss.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiKeyController {

    @Value("${api.google-maps}")
    private String googleMapsApiKey;

    @Value("${api.firebase}")
    private String firebaseApiKey;

    @Value("${api.recaptcha}")
    private String recaptchaKey;

    @GetMapping("/keys")
    public Map<String, String> getApiKeys() {
        return Map.of(
                "googleMapsApiKey", googleMapsApiKey,
                "firebaseApiKey", firebaseApiKey,
                "recaptchaKey", recaptchaKey
        );
    }
}

