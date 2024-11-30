import React, { useState, useEffect } from "react";
import backgroundImage from "../images/BG2.jpg";

function LoadingServer() {
    const [progress, setProgress] = useState(0);
    const [lifting, setLifting] = useState(true);

    // Aumentar el progreso cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev < 100 ? prev + 25 : 100));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Cambiar el emoji de la pesa cada segundo para levantar/bajar
    useEffect(() => {
        const liftingInterval = setInterval(() => {
            setLifting((prev) => !prev); // Cambia el estado entre levantando y bajando
        }, 1000); // Cambia el emoji cada 1 segundo

        return () => clearInterval(liftingInterval);
    }, []);

    return (
        <div
            className="relative h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="relative h-full text-center text-white bg-black bg-opacity-60 flex flex-col justify-center items-center">
                {/* Título principal */}
                <h1
                    className="absolute w-full text-6xl font-bold"
                    style={{
                        fontFamily: "Akronim, cursive",
                        top: "33%",
                        color: "#890000",
                    }}
                >
                    El cambio es <span className="block text-6xl">HOY</span>
                </h1>

                {/* Subtítulo */}
                <h2
                    className="absolute text-xl"
                    style={{
                        fontFamily: "Roboto",
                        top: "78%",
                    }}
                >
                    El servidor está arrancando ...
                </h2>

                {/* Emoji de pesas (levantándose y bajando) */}
                <div
                    className={`absolute transition-all duration-1000 ease-in-out`}
                    style={{
                        left: "50%",
                        transform: `translateX(-50%) translateY(${
                            lifting ? "-10px" : "10px"
                        })`,
                        fontSize: "50px",
                        top: "65%",
                    }}
                >
                    {lifting ? "🏋🏼‍♂️" : "💪"}
                </div>

                {/* Contenedor de barra de progreso */}
                <div
                    className="absolute w-3/4 max-w-lg"
                    style={{
                        top: "83%",
                    }}
                >
                    <div className="relative bg-gray-300 rounded-full h-6 overflow-hidden shadow-lg">
                        {/* Barra de progreso */}
                        <div
                            className="bg-[#890000] h-full transition-all duration-1000 ease-in-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {/* Indicador de progreso */}
                    <p className="mt-2 text-lg text-gray-300">
                        {progress === 100 ? "Ya casi está ..." : `${progress}%`}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoadingServer;
