import React, { useEffect, useRef, useState } from "react";

interface WebcamTrackerProps {
  onSnapshot: (base64Image: string) => void;
}

const WebcamTracker: React.FC<WebcamTrackerProps> = ({ onSnapshot }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

const captureImage = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas || video.videoWidth === 0) {
    console.error('Video or canvas not ready');
    return;
  }

  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Validate the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData.data.some(byte => byte !== 0)) { // Check if image isn't blank
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        console.log('Captured valid image');
        onSnapshot(base64);
      } else {
        console.warn('Captured blank image');
      }
    }
  } catch (error) {
    console.error('Error capturing image:', error);
  }
};
  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setHasPermission(true);
            // Capture immediately after stream is ready
            setTimeout(captureImage, 500);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    enableStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ margin: '20px 0' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={320}
        height={240}
        style={{ borderRadius: 6, display: hasPermission ? 'block' : 'none' }}
      />
      {!hasPermission && (
        <div style={{ 
          width: 320, 
          height: 240, 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6
        }}>
          Waiting for camera permission...
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamTracker;