import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function VerificatedEmail() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Obtiene el token de la URL
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError("Falta el token en la URL.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://regymserver.onrender.com/users/verify-email?token=${token}`,
                    { method: "GET" }
                );

                const data = await response.json();

                if (response.ok) {
                    setMessage("E-mail verificado exitosamente.");
                } else {
                    setError(
                        data.error || "Hubo un problema al verificar el correo."
                    );
                }
            } catch (error) {
                setError("Error en la solicitud de verificación.");
            }
            setLoading(false);
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
                    Verificación de Correo Electrónico
                </h2>

                {/* Mensaje de éxito o error */}
                {loading ? (
                    <p className="text-gray-500 text-center mb-4">
                        Verificando...
                    </p>
                ) : message ? (
                    <p className="text-green-500 text-center mb-4">{message}</p>
                ) : error ? (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                ) : (
                    <p className="text-gray-500 text-center mb-4">
                        Cargando...
                    </p>
                )}

                {/* Botón para regresar a la página principal */}
                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Volver a la página principal
                    </a>
                </div>
            </div>
        </div>
    );
}

export default VerificatedEmail;
