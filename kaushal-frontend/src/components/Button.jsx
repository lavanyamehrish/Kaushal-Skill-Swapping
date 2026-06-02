export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
