import React, { useContext, useEffect } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./pages/MainLayout";
import Profile from "./pages/Profile";
import Diary from "./pages/Diary";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import WeightExercises from "./pages/WeightExercises";
import CardioExercises from "./pages/CardioExercises";
import { SessionProvider } from "./context/SessionContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Progreso from "./pages/Progreso";
import FavExercises from "./pages/FavExercises";
import ExerciseHistory from "./pages/ExerciseHistory";
import "./App.css";
import PoliticaDePrivacidad from "./pages/PoliticaDePrivacidad";
import VerificatedEmail from "./pages/VerificatedEmail";

function App() {
    return (
        <LoadingProvider>
            <AuthProvider>
                <SessionProvider>
                    <Router>
                        <AuthRoutes />
                    </Router>
                </SessionProvider>
            </AuthProvider>
        </LoadingProvider>
    );
}

// Separa las rutas en un componente basado en el estado de autenticación
function AuthRoutes() {
    const {
        token,
        login,
        logout,
        loading: authLoading,
    } = useContext(AuthContext);
    const { loading, showLoading, hideLoading } = useLoading();

    // Mostrar un estado de carga mientras verificamos si el usuario está autenticado
    useEffect(() => {
        // Mostramos el estado de carga cuando la autenticación está en proceso
        if (authLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [authLoading, showLoading, hideLoading]);

    // Mostrar un estado de carga mientras verificamos si el usuario está autenticado
    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            {/* Rutas para usuarios no autenticados */}
            {!token ? (
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/login" element={<Login onLogin={login} />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/politica-de-privacidad"
                        element={<PoliticaDePrivacidad isLoggedIn={false} />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/verify-email"
                        element={<VerificatedEmail />}
                    />
                    <Route path="*" element={<Navigate to="/welcome" />} />
                </Routes>
            ) : (
                // Rutas protegidas
                <MainLayout>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/diary" element={<Diary />} />
                        <Route
                            path="/verify-email"
                            element={<VerificatedEmail />}
                        />
                        <Route
                            path="/exercises"
                            element={<WeightExercises />}
                        />
                        <Route
                            path="/exercisesCardio"
                            element={<CardioExercises />}
                        />
                        <Route path="/progress" element={<Progreso />} />
                        <Route
                            path="/favExercises"
                            element={<FavExercises />}
                        />
                        <Route
                            path="/exerciseHistory"
                            element={<ExerciseHistory />}
                        />
                        <Route
                            path="/profile"
                            element={<Profile onLogout={logout} />}
                        />
                        <Route
                            path="/politica-de-privacidad"
                            element={<PoliticaDePrivacidad isLoggedIn={true} />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/dashboard" />}
                        />
                    </Routes>
                </MainLayout>
            )}
        </div>
    );
}

export default App;
