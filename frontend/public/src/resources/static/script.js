

// ✅ Start Camera
async function startCamera() {
    try {
        console.log("🔍 Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('video').srcObject = stream;
        console.log("✅ Camera started successfully!");
    } catch (error) {
        console.error("❌ Error accessing camera:", error);
        alert("Failed to access the camera. Please check permissions.");
    }
}

// ✅ Capture Image
function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('capturedImage');

    if (!video.srcObject) {
        alert("Camera not started! Please click 'Start Camera' first.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    imageDataUrl = canvas.toDataURL("image/png");
    capturedImage.src = imageDataUrl;
    capturedImage.style.display = "block";

    console.log("✅ Captured Image Data:", imageDataUrl);
}

// ✅ Upload Image to Backend
function uploadImage() {
    if (!imageDataUrl) {
      alert("No image captured! Please capture an image first.");
      return;
    }
  
    fetch('https://smartvoter-mvp.uc.r.appspot.com/api/upload-face', {  // Replace with your actual backend URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageDataUrl }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Upload successful:', data);
      alert('Upload successful!');  // Or handle success feedback as needed
    })
    .catch(error => {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.'); // Or handle error feedback
    });
  }
  

// ✅ Ensure functions are available globally
window.startCamera = startCamera;
window.captureImage = captureImage;
window.uploadImage = uploadImage;

console.log("✅ script.js loaded successfully!");
