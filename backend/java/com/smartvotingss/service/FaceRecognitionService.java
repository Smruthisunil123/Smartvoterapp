package com.smartvotingss.service;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class FaceRecognitionService {

    public boolean verifyFace(byte[] imageBytes) throws IOException {
        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create()) {
            ByteString imgBytes = ByteString.copyFrom(imageBytes);
            Image img = Image.newBuilder().setContent(imgBytes).build();

            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(Feature.newBuilder().setType(Feature.Type.FACE_DETECTION))
                    .setImage(img)
                    .build();

            List<AnnotateImageResponse> responses = vision.batchAnnotateImages(List.of(request)).getResponsesList();
            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    System.out.println("Error: " + res.getError().getMessage());
                    return false;
                }
                return !res.getFaceAnnotationsList().isEmpty();
            }
        }
        return false;
    }
}
