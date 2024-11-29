import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ResidentManagement from "./pages/ResidentManagement";
import ApplicationRequest from "./pages/ApplicationRequest";
import IncidentReport from "./pages/IncidentReport";
import IncidentReportViewPage from "./pages/IncidentRepotViewPage";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
import EditResidentPage from "./pages/EditResidentPage ";
import AddResidentPage from "./pages/AddResidentPage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resident-management/add-resident"
                    element={
                        <ProtectedRoute>
                            <AddResidentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resident-management/edit-resident"
                    element={
                        <ProtectedRoute>
                            <EditResidentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resident-management"
                    element={
                        <ProtectedRoute>
                            <ResidentManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/application-request"
                    element={
                        <ProtectedRoute>
                            <ApplicationRequest />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incident-report"
                    element={
                        <ProtectedRoute>
                            <IncidentReport />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incident-report-view/:blotter_id"
                    element={
                        <ProtectedRoute>
                            <IncidentReportViewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user-management"
                    element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
