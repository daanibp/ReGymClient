import React, { createContext, useContext, useState, useEffect } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [serverAvailable, setServerAvailable] = useState(false);

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    const checkServer = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/healthcheck`
            );
            if (response.ok) {
                setServerAvailable(true);
            } else {
                throw new Error("Server not OK");
            }
        } catch (error) {
            console.error("Server not reachable:", error);
            setServerAvailable(false);
        }
    };

    // Check server availability on mount and periodically
    useEffect(() => {
        const performCheck = async () => {
            await checkServer();
            setLoading(false);
        };

        performCheck();
        const interval = setInterval(checkServer, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <LoadingContext.Provider
            value={{ loading, showLoading, hideLoading, serverAvailable }}
        >
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
