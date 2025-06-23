/* eslint-disable react-hooks/exhaustive-deps */
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
      console.error("Video or canvas not ready");
      return;
    }

    const desiredWidth = 1080;
    const desiredHeight = 1920; // 9:16 portrait

    canvas.width = desiredWidth;
    canvas.height = desiredHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Crop from center to maintain 9:16 ratio
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const canvasAspectRatio = desiredWidth / desiredHeight;

      let sx = 0,
        sy = 0,
        sWidth = video.videoWidth,
        sHeight = video.videoHeight;

      if (videoAspectRatio > canvasAspectRatio) {
        // Wider → crop sides
        sWidth = video.videoHeight * canvasAspectRatio;
        sx = (video.videoWidth - sWidth) / 2;
      } else {
        // Taller → crop top/bottom
        sHeight = video.videoWidth / canvasAspectRatio;
        sy = (video.videoHeight - sHeight) / 2;
      }

      ctx.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        desiredWidth,
        desiredHeight
      );

      const base64 = canvas.toDataURL("image/jpeg", 0.9); // Higher quality
      console.log("Captured valid image");
      onSnapshot(base64);
    }
  };

  useEffect(() => {
    let intervalId: number | null = null;

    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }, // Camera HD feed
            facingMode: "user", // Use "environment" for rear camera
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setHasPermission(true);
            captureImage(); // Capture immediately once ready

            // Set interval to capture every 10 seconds
            intervalId = setInterval(() => {
              captureImage();
            }, 10000);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    enableStream();

    return () => {
      // Cleanup: stop video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      // Clear interval
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div style={{ margin: "20px 0" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "auto",
          height: 500,
          borderRadius: 6,
          display: hasPermission ? "block" : "none",
        }}
      />
      {!hasPermission && (
        <div
          style={{
            width: 320,
            height: 240,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
          }}
        >
          Waiting for camera permission...
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default WebcamTracker;
