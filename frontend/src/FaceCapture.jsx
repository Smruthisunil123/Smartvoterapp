import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const FaceCapture = ({ voterId }) => {
  const webcamRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);

  const videoConstraints = {
    width: 400,
    facingMode: "user",
  };

  const startCamera = () => {
    setCameraStarted(true);
    setCapturedImage(null);
    setFaceVerified(false);
  };

  const stopCamera = useCallback(() => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraStarted(false);
    }
  }, []);

  const captureImage = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    stopCamera();
    setFaceVerified(false);
  };

  const simulateVerification = () => {
    if (capturedImage) {
      setFaceVerified(true);
    } else {
      alert("Please capture your face first.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>FACE RECOGNITION FOR VOTER VERIFICATION</h2>

      {cameraStarted && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            marginBottom: "10px"
          }}
        />
      )}

      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured Face"
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "10px",
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}
        />
      )}

      <div style={{
        marginTop: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center"
      }}>
        <button style={buttonStyle} onClick={startCamera}>Start Camera</button>
        <button style={buttonStyle} onClick={captureImage}>Capture Face</button>
        <button style={buttonStyle} onClick={simulateVerification}>Simulate Verification</button>
      </div>

      {faceVerified && (
        <h3 style={{ color: "green", marginTop: "10px" }}>✅ Face Verified Successfully (Simulated)</h3>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default FaceCapture;
