import './App.css';
import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FaceCapture from "./FaceCapture";
import { Html5Qrcode } from "html5-qrcode";
import PollingMap from './PollingMap';

function App() {
  const [voterId, setVoterId] = useState(null);
  const qrScannerRef = useRef(null);
  const isScanningRef = useRef(false); // Prevents repeated scans

  const verifyQrCode = async (qrCode) => {
    try {
      const response = await fetch("https://smartvoter-mvp.uc.r.appspot.com/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ QR Verified! Voter ID: " + data.voterId);
        setVoterId(data.voterId);
      } else {
        alert("❌ Invalid QR Code!");
      }
    } catch (error) {
      console.error("QR verification failed:", error);
      alert("❌ Server error during QR verification.");
    }
  };

  const startQRScanner = async () => {
    if (qrScannerRef.current) {
      await qrScannerRef.current.stop();
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    qrScannerRef.current = html5QrCode;
    isScanningRef.current = false;

    const config = {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: "environment"},
        config,
        (decodedText) => {
          if (isScanningRef.current) return;
          isScanningRef.current = true;

          console.log("✅ QR Code detected:", decodedText);
          html5QrCode.stop().then(() => {
            verifyQrCode(decodedText);
          });
        },
        (errorMessage) => {
          // Don't spam console with the same error
          const readerElem = document.getElementById("qr-reader");
          if (readerElem && !isScanningRef.current) {
            readerElem.innerText = "Could not scan QR. Try adjusting the angle or lighting.";
          }
        }
      )
      .catch((err) => {
        console.error("❌ Unable to start QR scanner:", err);
      });
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current
          .stop()
          .catch((err) => console.error("Stop scanner error:", err));
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1f2d3d", marginBottom: "40px" }}>
                SMART VOTING SYSTEM
              </h1>

              <div
                style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "40px",
                }}
              >
                {/* QR Code Scanner */}
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ marginBottom: "10px" }}>Scan Your Voter QR Code</h2>
                  <Webcam
                    audio={false}
                    screenshotFormat="image/jpeg"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      borderRadius: "10px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={startQRScanner}
                      style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#1f77b4",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Start QR Scanner
                    </button>

                    <button
                      onClick={() => verifyQrCode("VALID-QR-CODE")}
                      style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Simulate QR Scan
                    </button>
                  </div>
                </div>

                {/* Face Capture (always shown) */}
                <FaceCapture voterId={voterId} />

                {/* Polling Map */}
                <h2>NEAREST POLLING STATION</h2>
                <div style={{ width: "100%", height: "400px" }}>
                  <PollingMap />
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
