package com.smartvotingss.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static Storage storageInstance; // Singleton Storage instance

    // ✅ Initialize Firebase Admin SDK
    @Bean
    public FirebaseApp initializeFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            InputStream serviceAccount = new ClassPathResource("firebase-adminsdk.json").getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("smartvoter-mvp.appspot.com")  // ✅ Replace with your actual Firebase Storage bucket
                    .setDatabaseUrl("https://smartvoter-mvp-default-rtdb.firebaseio.com") // ✅ Ensure correct Firebase Realtime DB URL
                    .build();

            FirebaseApp app = FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized successfully!");
            return app;
        } else {
            System.out.println("🔥 Firebase already initialized.");
            return FirebaseApp.getInstance();
        }
    }

    // ✅ Initialize Firebase Cloud Storage
    @Bean
    public Storage initializeFirebaseStorage() throws IOException {
        if (storageInstance == null) { // Ensure Singleton
            InputStream serviceAccount = new ClassPathResource("firebase-adminsdk.json").getInputStream();
            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

            storageInstance = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId("smartvoter-mvp") // ✅ Ensure correct Project ID
                    .build()
                    .getService();
        }
        return storageInstance;
    }

    // ✅ Public static method for manual storage initialization (for testing)
    public static Storage getFirebaseStorageInstance() throws IOException {
        if (storageInstance == null) {
            FirebaseConfig config = new FirebaseConfig();
            storageInstance = config.initializeFirebaseStorage();
        }
        return storageInstance;
    }
}
