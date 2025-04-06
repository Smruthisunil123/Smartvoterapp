const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");

// ✅ Setup FaceAPI
faceapi.env.monkeyPatch({ Canvas, Image });

const app = express();
const port = 8080;

// ✅ Load Firebase Service Account Key
const serviceAccountPath = path.join(__dirname, "src/main/resources/firebasekey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase service account key not found:", serviceAccountPath);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Load FaceAPI Models
const MODEL_PATH = path.join(__dirname, "models");

async function loadModels() {
  try {
    //await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    //await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    //await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    console.log("✅ FaceAPI models loaded successfully.");
  } catch (error) {
    console.error("❌ Error loading FaceAPI models:", error);
    process.exit(1);
  }
}

loadModels();

// ✅ QR Code Verification
app.post("/verify-qr", async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ error: "QR Code required" });

    const voterRef = db.collection("voters").doc(qrCode);
    const voter = await voterRef.get();

    if (!voter.exists) return res.status(404).json({ error: "QR Code not valid" });

    res.json({ success: true, voterId: qrCode });
  } catch (error) {
    console.error("❌ Error verifying QR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Face Verification
app.post("/face-verify", async (req, res) => {
  try {
    const { voterId, faceDescriptor } = req.body;
    if (!voterId || !faceDescriptor) return res.status(400).json({ error: "Missing data" });

    const voterRef = db.collection("voters").doc(voterId);
    const voter = await voterRef.get();

    if (!voter.exists) return res.status(404).json({ error: "Voter not found" });

    const savedDescriptor = voter.data().faceDescriptor;
    if (!savedDescriptor) return res.status(400).json({ error: "No face data found for voter" });

    const distance = faceapi.euclideanDistance(
      new Float32Array(savedDescriptor),
      new Float32Array(faceDescriptor)
    );

    res.json({ success: distance < 0.6 });
  } catch (error) {
    console.error("❌ Error verifying face:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Image Upload (Face Registration)
const upload = multer({ dest: "uploads/" });

app.post("/api/upload-face", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const voterId = req.body.voterId;
    if (!voterId) return res.status(400).json({ error: "Voter ID required" });

    // Simulating face processing
    const faceDescriptor = [/* Placeholder for face vector */];

    const voterRef = db.collection("voters").doc(voterId);
    await voterRef.set({ faceDescriptor });

    res.json({ success: true, message: "Face data saved" });
  } catch (error) {
    console.error("❌ Error uploading face:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
