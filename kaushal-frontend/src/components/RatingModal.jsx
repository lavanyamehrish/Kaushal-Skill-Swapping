import React, { useState } from "react";

export default function RatingModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-80 text-center space-y-4">
        <h2 className="text-lg font-semibold">Rate your session</h2>
        <div className="flex justify-center gap-2 text-2xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={`cursor-pointer ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {rating < 3 && (
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please share what went wrong..."
            className="w-full border rounded-lg p-2 text-sm"
          />
        )}

        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
}