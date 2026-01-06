// InternetStatusBanner.js
import { useState, useEffect } from "react";

export default function InternetStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null; // don’t show if online

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      backgroundColor: "red",
      color: "white",
      textAlign: "center",
      padding: "10px",
      zIndex: 1000
    }}>
      ⚠️ No Internet Connection. Please check your network.
    </div>
  );
}
