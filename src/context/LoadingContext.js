import React, { createContext, useContext, useState } from "react";

// Crear el contexto de carga
const LoadingContext = createContext();

// Hook para acceder al contexto
export const useLoading = () => useContext(LoadingContext);

// Proveedor de contexto para el estado de carga
export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    // Funciones para manejar el estado de carga
    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    return (
        <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
