package com.smartvotingss.controller;

import com.smartvotingss.service.FirebaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private static final Logger logger = Logger.getLogger(FileUploadController.class.getName());
    private final FirebaseService firebaseService;

    public FileUploadController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File is empty!"));
            }

            // Generate a unique file name
            String fileName = "uploads/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            logger.info("Uploading file to Firebase Storage: " + fileName);
            
            // Convert file to bytes and upload to Firebase
            String fileUrl = firebaseService.uploadImage(file.getBytes(), fileName);
            logger.info("File uploaded successfully: " + fileUrl);

            return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error uploading file: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload file."));
        }
    }
}
