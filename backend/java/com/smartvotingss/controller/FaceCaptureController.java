package com.smartvotingss.controller;

import com.smartvotingss.service.FirebaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api")
public class FaceCaptureController {

    private static final Logger logger = Logger.getLogger(FaceCaptureController.class.getName());
    private final FirebaseService firebaseService;

    public FaceCaptureController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    @PostMapping("/upload-face")
    public ResponseEntity<Map<String, String>> uploadFace(@RequestBody Map<String, String> requestBody) {
        try {
            logger.info("Received face capture request.");

            // Validate input
            if (requestBody == null || !requestBody.containsKey("image")) {
                logger.warning("Missing image data in request body.");
                return ResponseEntity.badRequest().body(Map.of("error", "No image data found."));
            }

            String base64Image = requestBody.get("image");
            if (base64Image == null || base64Image.trim().isEmpty()) {
                logger.warning("Received empty image data.");
                return ResponseEntity.badRequest().body(Map.of("error", "Empty image data."));
            }

            // Remove Base64 prefix if it exists
            String imageData = base64Image.replaceFirst("^data:image/[^;]+;base64,", "");
            
            // Decode Base64 safely
            byte[] imageBytes;
            try {
                imageBytes = Base64.getDecoder().decode(imageData);
            } catch (IllegalArgumentException e) {
                logger.log(Level.SEVERE, "Invalid Base64 encoding: " + e.getMessage(), e);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid Base64 image format."));
            }
            
            // Generate a unique file name
            String fileName = "faces/" + UUID.randomUUID() + ".png";
            logger.info("Uploading image to Firebase Storage: " + fileName);
            
            // Upload image to Firebase
            String imageUrl = firebaseService.uploadImage(imageBytes, fileName);
            logger.info("Image uploaded successfully: " + imageUrl);
            
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading image: " + e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload image."));
        }
    }
}
