import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import SharedWhiteboard from "../components/SharedWhiteboard";

export default function VideoRoom() {
  const { id: roomID } = useParams();
  const videoRef = useRef(null);
  const [showBoard, setShowBoard] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID || "0");
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          setError("ZegoCloud credentials not configured. Please set VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET environment variables.");
          console.error("❌ Missing ZegoCloud credentials");
          return;
        }

        const userID = String(Math.floor(Math.random() * 99999));
        const userName = "User_" + userID;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, serverSecret, roomID, userID, userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
          container: videoRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        });
      } catch (err) {
        setError(`Failed to initialize video: ${err.message}`);
        console.error("❌ Video initialization error:", err);
      }
    };

    initializeVideo();
  }, [roomID]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Video Conference Error</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-screen h-screen relative overflow-hidden">
      
      {/* ✅ Left: Video UI (shrinks when whiteboard opens) */}
      <div
        ref={videoRef}
        className={`transition-all duration-300 h-full ${
          showBoard ? "w-1/2" : "w-full"
        }`}
      />

      {/* ✅ Right: Shared Whiteboard */}
      {showBoard && (
        <div className="w-1/2 h-full bg-white border-l shadow-xl">
          <SharedWhiteboard roomID={roomID} />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowBoard(!showBoard)}
        className="absolute top-4 left-4 bg-white px-4 py-2 rounded shadow z-50"
      >
        {showBoard ? "Hide Whiteboard" : "Show Whiteboard"}
      </button>
    </div>
  );
}
