import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import ChatThread from "./pages/ChatThread";
import VideoRoom from "./pages/VideoRoom";
import ProjectsPage from "./pages/ProjectsPage";

import { useAuth } from "./context/AuthContext";

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />

        <Route path="/" element={<Private><Dashboard/></Private>} />
        <Route path="/onboarding" element={<Private><Onboarding/></Private>} />
        <Route path="/inbox" element={<Private><Inbox/></Private>} />
        <Route path="/chat/:id" element={<Private><ChatThread/></Private>} />
        <Route path="/video/:id" element={<Private><VideoRoom/></Private>} />
        <Route path="/projects" element={<ProjectsPage />} />

        
      </Routes>
    </BrowserRouter>
  );
}
