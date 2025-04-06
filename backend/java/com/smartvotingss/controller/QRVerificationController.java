package com.smartvotingss.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/verify-qr")
public class QRVerificationController {

    @PostMapping
    public ResponseEntity<?> verifyQrCode(@RequestBody Map<String, String> request) {
        String qrCode = request.get("qrCode");

        // Dummy validation logic for now
        if ("VALID-QR-CODE".equals(qrCode)) {
            return ResponseEntity.ok(Map.of("success", true, "voterId", "123456"));
        } else {
            return ResponseEntity.ok(Map.of("success", false));
        }
    }
}
