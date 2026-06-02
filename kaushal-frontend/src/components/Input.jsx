export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none ${className}`}
      {...props}
    />
  );
}
