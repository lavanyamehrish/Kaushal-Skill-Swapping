import { Link } from "react-router-dom";

export default function Inbox() {
  // Replace with matches fetched from Firestore later
  const mock = [{ id: "abc123", name: "Alex Teacher", last: "Let's schedule" }];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      {mock.map(m => (
        <Link to={`/chat/${m.id}`} key={m.id} className="block border p-3 rounded hover:bg-gray-50">
          <div className="font-medium">{m.name}</div>
          <div className="text-sm text-gray-600">{m.last}</div>
        </Link>
      ))}
    </div>
  );
}
