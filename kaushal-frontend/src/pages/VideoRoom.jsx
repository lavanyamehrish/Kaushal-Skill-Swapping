import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import SharedWhiteboard from "../components/SharedWhiteboard";

export default function VideoRoom() {
  const { id: roomID } = useParams();
  const videoRef = useRef(null);
  const [showBoard, setShowBoard] = useState(true);

  useEffect(() => {
    const appID = 1423944563;
    const serverSecret = "f132cdf04c817ebe35d0a17ddfb835a8";

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
  }, [roomID]);

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
