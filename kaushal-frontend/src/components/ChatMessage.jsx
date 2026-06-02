export default function ChatMessage({ message }) {
  const isMine = message.sender === "me";
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl ${
          isMine ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}