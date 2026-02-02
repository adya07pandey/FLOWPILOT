import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WorkflowPage from "./pages/Workflows.jsx";

import "./App.css"
import Tasks from "./pages/Tasks.jsx";
import CreateWorkflow from "./pages/CreateWorkflow.jsx";
import Home from "./pages/Home.jsx";
import Approvals from "./pages/Approvals.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <WorkflowPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/createworkflow/:id"
            element={
              <ProtectedRoute>
                <CreateWorkflow />
              </ProtectedRoute>
            }
          />

          <Route
            path="/createworkflow"
            element={
              <ProtectedRoute>
                <CreateWorkflow />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <Approvals />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
