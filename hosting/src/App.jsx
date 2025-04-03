import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [noQrCode, setNoQrCode] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceRecognitionActive, setFaceRecognitionActive] = useState(false);
  const [faceDetectionResult, setFaceDetectionResult] = useState(null);
  const [backendValidationResult, setBackendValidationResult] = useState(null);
  const [votingAllowed, setVotingAllowed] = useState(false);
  const webcamRef = useRef(null);
  const faceWebcamRef = useRef(null);

  const detectFaces = useCallback(async () => {
    if (faceWebcamRef.current && modelsLoaded && qrCodeData) {  
      setTimeout(async() => {

      if(!faceWebcamRef.current){
        return
      }
      const screenshot = faceWebcamRef.current.getScreenshot({ width: 640, height: 480 });
      
      if(screenshot){
        const img = new Image();
        img.src = screenshot;
        img.crossOrigin = 'anonymous'

        img.onload = async () => {
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          setFaceDetectionResult(detections);

          // Send QR code data and face detection results to backend
          fetch('https://smartvoter-mvp.uc.r.appspot.com/face-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qrCodeData, faceDetections: detections }),
          })
          .then(response => response.json()).then(data => {
            console.log('Backend response:', response.status, data);
            if (response.ok) {
              setBackendValidationResult({ success: true, ...data });
              if (data.success) {
                setVotingAllowed(true);
              }
            } else {
              setBackendValidationResult({ success: false, message: data.message || 'Validation failed.' });
            }
          }).catch(error => {
            console.error('Error contacting backend:', error);
            setBackendValidationResult({ success: false, message: error.message || 'Failed to connect to backend.' });
          }).then((data) => {
            if (data && data.success) {
              setVotingAllowed(true);
            }
          });
          console.log("Face detection results:", detections);
        };
      }
    }, 500)
    }
     else {

    }
  }, [faceWebcamRef, modelsLoaded, qrCodeData]); // Remove unused dep: votingAllowed

  useEffect(() => {
    let faceDetectionInterval;
    if (faceRecognitionActive && modelsLoaded) {
      faceDetectionInterval = setInterval(detectFaces, 1000); // Check every 1000ms
    }

    return () => clearInterval(faceDetectionInterval);
  }, [faceRecognitionActive, detectFaces, modelsLoaded]);


  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, image.width, image.height);
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          if (code) {
            setQrCodeData(code.data);
            setNoQrCode(false);
            setFaceRecognitionActive(true);
            console.log("QR code found:", code.data); // Added log
          } else {
            setQrCodeData(null);
            setNoQrCode(true);
            console.log("No QR code found");
          }
        };

        image.onerror = (error) => {
          console.error("Error loading image:", error);
          setNoQrCode(true);
        };
      }
    }
  }, [webcamRef]);


  useEffect(() => {
    const interval = setInterval(capture, 2000);

    return () => clearInterval(interval);
  }, [capture]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      console.log("models loaded")
      setModelsLoaded(true);
    };

    loadModels();
  }, []);

  useEffect(() => {
    document.addEventListener('DOMContentLoaded', function() {
      const appTitleElement = document.getElementById('appTitle');
      if (appTitleElement) {
        console.log('App title element loaded:', appTitleElement); 
      }
    });
  }, []);


  return (
    <>
      <div className="app-container">
        <h1 className="app-title" id="appTitle">Smart Voting System</h1>
        {faceRecognitionActive ? (
          <>
          <Webcam
            audio={false}
            ref={faceWebcamRef}
            screenshotFormat="image/jpeg" className="webcam" />{faceDetectionResult ? (
              <p>Faces detected: {faceDetectionResult.length}</p>
              
              
            ) : null}
            {backendValidationResult === null ? (
              <p>Connecting to backend...</p>
            ) : backendValidationResult.success ? (
              <p>Validation successful!</p>
            ) : (
              <p>Validation failed.</p>
            )}
            {backendValidationResult && backendValidationResult.message && (
              <p>{backendValidationResult.message}</p>
            )}
            {votingAllowed && (
            <button onClick={() => alert('Vote Cast!')}>
              Cast Vote
            </button>
          )}
            
          </>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
            />
            <button onClick={capture}>Scan QR Code</button>
            <div className="qr-code-data">
              {qrCodeData ? (
                <p>QR Code Data: {qrCodeData}</p>
              ) : noQrCode ? (
                <p>No QR code detected</p>
              ) : (
                <p>Scanning for QR code...</p>
              )}
            </div>
          </>
        )}
        </div>
      
        
    </>
  );
}

export default App;
