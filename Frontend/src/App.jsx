import { Routes, Route } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OwnerDashboard from "./pages/OwnerDashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import FrameDetails from "./pages/FrameDetails";
import Players from "./pages/Players";
import PlayerMoney from "./pages/PlayerMoney";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <div className="flex min-h-screen items-center justify-center px-4">
            <Login />
          </div>
        }
      />
      <Route
        path="/signup"
        element={
          <div className="flex min-h-screen items-center justify-center px-4">
            <Signup />
          </div>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRole="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/player"
        element={
          <ProtectedRoute allowedRole="player">
            <PlayerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/frames/:frameId"
        element={
          <ProtectedRoute allowedRole="owner">
            <FrameDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/players"
        element={
          <ProtectedRoute allowedRole="owner">
            <Players />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/players/:playerId"
        element={
          <ProtectedRoute allowedRole="owner">
            <PlayerMoney />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
