import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="border p-4 rounded">
        <p className="mb-2">Your matches (coming soon)</p>
        <Link to="/inbox" className="underline">
          Go to Inbox
        </Link>
      </div>
    </div>
  );
}
