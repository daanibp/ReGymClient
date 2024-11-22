import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function VerificatedEmail() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Obtener parámetros de la URL
    const query = new URLSearchParams(useLocation().search);
    const status = query.get("status"); // Obtener el valor de 'status'

    useEffect(() => {
        if (status === "success") {
            setMessage("E-mail verificado exitosamente.");
        } else if (status === "error") {
            setError("Hubo un error al verificar el correo.");
        }
        setLoading(false);
    }, [status]);

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
