package com.smartvotingss.service;

import com.smartvotingss.config.FirebaseConfig;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.DependsOn;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@DependsOn("initializeFirebase")  // Ensures FirebaseConfig initializes first
public class FirebaseService {

    private Firestore firestore;
    private final Storage storage;

    @Value("${firebase.bucket-name}")
    private String bucketName;

    // ✅ Constructor Injection for Storage
    public FirebaseService(Storage storage) {
        this.storage = storage;
    }

    @PostConstruct
    public void init() {
        this.firestore = FirestoreClient.getFirestore();
        System.out.println("✅ Firestore instance initialized.");
    }

    public Firestore getFirestore() {
        return firestore;
    }

    // ✅ Upload image to Firebase Storage
    public String uploadImage(byte[] imageBytes, String fileName) {
        try {
            if (storage == null) {
                throw new IllegalStateException("❌ Storage is not initialized!");
            }

            Bucket bucket = storage.get(bucketName);
            if (bucket == null) {
                throw new RuntimeException("❌ Firebase bucket not found: " + bucketName);
            }

            Blob blob = bucket.create(fileName, imageBytes);
            blob.createAcl(com.google.cloud.storage.Acl.of(com.google.cloud.storage.Acl.User.ofAllUsers(), com.google.cloud.storage.Acl.Role.READER));

            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
            String imageUrl = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    bucketName, encodedFileName);

            System.out.println("✅ Image uploaded successfully: " + imageUrl);
            return imageUrl;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("❌ Failed to upload image: " + e.getMessage(), e);
        }
    }

    // ✅ Standalone Test Method (Properly Initialize Storage)
    public static void main(String[] args) {
        try {
            FirebaseConfig firebaseConfig = new FirebaseConfig();
            Storage storage = firebaseConfig.initializeFirebaseStorage();
            FirebaseService service = new FirebaseService(storage);

            byte[] dummyData = "test-data".getBytes();
            String fileName = "faces/test.png";

            String url = service.uploadImage(dummyData, fileName);
            System.out.println("✅ Uploaded Successfully: " + url);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}