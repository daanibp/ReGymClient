import React, { useState, useContext, useEffect, useCallback } from "react";
import Fecha from "../components/Fecha";
import BeastMode from "../images/BeastMode.jpg";
import Cardio from "../images/Cardiov2.jpg";
import { AuthContext } from "../context/AuthContext";
import { SessionContext } from "../context/SessionContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import "../estilos/Diary.css";
import { FaSpinner } from "react-icons/fa";

function Diary() {
    const [currentView, setCurrentView] = useState("initial");

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [exercises, setExercises] = useState([]);
    const [exercisesCardio, setExercisesCardio] = useState([]);
    const [sets, setSets] = useState([]);
    const [intervals, setIntervals] = useState([]);

    const [isEditable, setIsEditable] = useState(false);

    const [isLoadingPesas, setIsLoadingPesas] = useState(false);
    const [isLoadingCardio, setIsLoadingCardio] = useState(false);
    const [isPesasDisabled, setIsPesasDisabled] = useState(false);
    const [isCardioDisabled, setIsCardioDisabled] = useState(false);

    const [isAddingSet, setIsAddingSet] = useState(false);
    const [isAddingInterval, setIsAddingInterval] = useState(false);

    const [deletingExerciseId, setDeletingExerciseId] = useState(null);
    const [deletingSetId, setDeletingSetId] = useState(null);
    const [deletingIntervalId, setDeletingIntervalId] = useState(null);

    const {
        selectedDate,
        sessionIdPesas,
        sessionIdCardio,
        //updateSelectedDate,
        updateSessionIdPesas,
        updateSessionIdCardio,
    } = useContext(SessionContext);

    const formatLocalDate = (date) => {
        const year = date.getFullYear(); // 2024
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 11 -> "11"
        const day = date.getDate().toString().padStart(2, "0"); // 5 -> "05"

        return `${year}-${month}-${day}`; // 2024-11-05
    };

    useEffect(() => {
        if (location.state?.currentView) {
            setCurrentView(location.state.currentView);
        }
    }, [location.state]);

    useEffect(() => {
        // Busca la sesión por fecha usando el selectedDate del contexto
        const fetchSessionByDate = async (date) => {
            try {
                const sessionDate = formatLocalDate(date);
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/sessions/pesas/getSessionByDate?date=${sessionDate}&userId=${user.id}`
                );
                const data = await response.json();

                if (response.ok && data) {
                    updateSessionIdPesas(data.id); // Actualiza el sessionId en el contexto
                } else {
                    updateSessionIdPesas(null);
                    setExercises([]);
                    setSets([]);
                }
            } catch (error) {
                console.error("Error al buscar sesión por fecha:", error);
                updateSessionIdPesas(null);
            }
        };

        const fetchSessionCardioByDate = async (date) => {
            try {
                const sessionDate = formatLocalDate(date);
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/sessions/cardio/getSessionByDate?date=${sessionDate}&userId=${user.id}`
                );
                const data = await response.json();

                if (response.ok && data) {
                    updateSessionIdCardio(data.id); // Actualiza el sessionId en el contexto
                } else {
                    updateSessionIdCardio(null); // Limpia el sessionId si no se encuentra sesión
                    setExercisesCardio([]);
                    setIntervals([]);
                }
            } catch (error) {
                console.error(
                    "Error al buscar sesión de cardio por fecha:",
                    error
                );
                updateSessionIdCardio(null);
            }
        };

        if (selectedDate) {
            if (currentView === "pesas") fetchSessionByDate(selectedDate);
            else if (currentView === "cardio")
                fetchSessionCardioByDate(selectedDate);
        }
    }, [
        selectedDate,
        updateSessionIdPesas,
        updateSessionIdCardio,
        currentView,
        user.id,
    ]);

    const fetchExercisesAndSets = useCallback(async () => {
        if (!sessionIdPesas) {
            setExercises([]);
            setSets([]);
            return;
        }

        try {
            const responseExercises = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/exercises/getExerciseBySessionId/${sessionIdPesas}`
            );
            const exercisesData = await responseExercises.json();

            if (responseExercises.ok) {
                setExercises(exercisesData);
            } else {
                setExercises([]);
            }

            const responseSets = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets/getSetBySessionId/${sessionIdPesas}`
            );
            const setsData = await responseSets.json();

            if (responseSets.ok) {
                setSets(setsData);
            } else {
                setSets([]);
            }
        } catch (error) {
            console.error("Error fetching exercises or sets:", error);
        }
    }, [sessionIdPesas]);

    const fetchExercisesAndIntervals = useCallback(async () => {
        if (!sessionIdCardio) {
            setExercisesCardio([]);
            setIntervals([]);
            return;
        }

        try {
            const responseExercises = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/exercises/getExerciseBySessionId/${sessionIdCardio}`
            );
            const exercisesData = await responseExercises.json();

            if (responseExercises.ok) {
                setExercisesCardio(exercisesData);
            } else {
                setExercisesCardio([]);
            }

            const responseIntervals = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals/getIntervalBySessionId/${sessionIdCardio}`
            );
            const intervalsData = await responseIntervals.json();

            if (responseIntervals.ok) {
                setIntervals(intervalsData);
            } else {
                setIntervals([]);
            }
        } catch (error) {
            console.error(
                "Error fetching cardio exercises or cardio intervals:",
                error
            );
        }
    }, [sessionIdCardio]);

    // Llamar a fetchExercisesAndSets en el useEffect
    useEffect(() => {
        if (currentView === "pesas") {
            fetchExercisesAndSets();
        } else if (currentView === "cardio") {
            fetchExercisesAndIntervals();
        }
    }, [fetchExercisesAndSets, fetchExercisesAndIntervals, currentView]);

    const openPesas = async () => {
        setIsLoadingPesas(true);
        setIsPesasDisabled(true); // Deshabilitar el botón de Pesas
        setIsCardioDisabled(true); // Deshabilitar el botón de Cardio

        const session = createSession("Pesas");
        const session_date = formatLocalDate(selectedDate);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sessions/pesas?date=${session_date}&userId=${user.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(session),
                }
            );

            if (response.ok) {
                const sessionData = await response.json();
                updateSessionIdPesas(sessionData.id);
                setCurrentView("pesas");
            } else {
                setCurrentView("initial");
                console.error("Failed to create or fetch session.");
            }
        } catch (error) {
            console.error("Error creating or fetching session:", error);
        } finally {
            setIsLoadingPesas(false); // Detener el estado de carga
            setIsPesasDisabled(false); // Habilitar el botón de Pesas
            setIsCardioDisabled(false); // Habilitar el botón de Cardio
        }
    };

    const openCardio = async () => {
        setIsLoadingCardio(true);
        setIsCardioDisabled(true); // Deshabilitar el botón de Cardio
        setIsPesasDisabled(true); // Deshabilitar el botón de Pesas

        const session = createSession("Cardio");
        const session_date = formatLocalDate(selectedDate);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sessions/cardio?date=${session_date}&userId=${user.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(session),
                }
            );

            if (response.ok) {
                const sessionData = await response.json();
                updateSessionIdCardio(sessionData.id);
                setCurrentView("cardio");
            } else {
                setCurrentView("initial");
                console.error("Failed to create or fetch session.");
            }
        } catch (error) {
            console.error("Error creating or fetching session:", error);
        } finally {
            setIsLoadingCardio(false); // Detener el estado de carga
            setIsPesasDisabled(false); // Habilitar el botón de Pesas
            setIsCardioDisabled(false); // Habilitar el botón de Cardio
        }
    };

    function createSession(type) {
        const today = new Date();

        // Obtener la fecha en formato YYYY-MM-DD
        const session_date = formatLocalDate(selectedDate); // 'YYYY-MM-DD'

        // Formatear la hora actual como HH:mm:ss
        const start_time = today.toTimeString().split(" ")[0]; // 'HH:mm:ss'

        const end_time = null;
        const duration = null;

        const session = {
            user_id: user.id,
            session_date: session_date,
            start_time: start_time,
            end_time: end_time,
            duration: duration,
            type: type,
        };

        return session;
    }

    const addSet = async (exercise_id) => {
        if (isAddingSet) return; // Evita doble clic
        setIsAddingSet(true); // Activa el spinner y deshabilita el botón

        const newSet = await createSet(exercise_id);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newSet),
                }
            );

            if (response.ok) {
                const addedSet = await response.json();
                setSets((prevSets) => [...prevSets, addedSet]); // Agregar a la UI
            }
        } catch (error) {
            console.error("Error adding set:", error);
        } finally {
            setIsAddingSet(false); // Reactiva el botón después de la petición
        }
    };

    // Crear set
    async function createSet(exercise_id) {
        // Filtra los sets que pertenecen a este ejercicio específico
        const exerciseSets = sets.filter(
            (set) => set.exercise_id === exercise_id
        );
        const nextSetNumber = exerciseSets.length + 1;
        const lastValue = await getLastValue(
            nextSetNumber,
            exercise_id,
            user.id
        );
        const set = {
            exercise_id: exercise_id,
            set_number: nextSetNumber,
            lastValue: lastValue,
            weight: null,
            reps: null,
        };
        return set;
    }

    const updateSet = (setId, field, value) => {
        // Actualizar el estado de sets, modificando solo el campo especificado (reps o weight) del set específico
        setSets((prevSets) =>
            prevSets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
            )
        );
    };

    const finishSet = async (setId, setNumber, updatedReps, updatedWeight) => {
        // Buscar el set en la lista de sets para obtener los detalles actuales
        const setToUpdate = sets.find((set) => set.id === setId);

        // Formatear y validar `updatedReps`
        let formattedReps = null;
        if (
            updatedReps !== null &&
            updatedReps !== undefined &&
            updatedReps !== ""
        ) {
            formattedReps = parseInt(
                updatedReps.toString().replace(",", "."),
                10
            );
            if (isNaN(formattedReps)) formattedReps = null; // Si el resultado es NaN, lo establece en null
        }

        // Formatear y validar `updatedWeight`
        let formattedWeight = null;
        if (
            updatedWeight !== null &&
            updatedWeight !== undefined &&
            updatedWeight !== ""
        ) {
            formattedWeight = parseFloat(
                updatedWeight.toString().replace(",", ".")
            ).toFixed(2);
            if (isNaN(formattedWeight)) formattedWeight = null; // Si el resultado es NaN, lo establece en null
        }

        // Asegurarse de que se encontró el set
        if (setToUpdate) {
            // Llamar a la API para actualizar el set
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/sets/updateSets/${setId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            exercise_id: setToUpdate.exercise_id,
                            set_number: setNumber,
                            weight: formattedWeight,
                            reps: formattedReps,
                        }),
                    }
                );

                if (response.ok) {
                    const updatedSet = await response.json();
                    // Actualizamos el lastValue del siguiente set
                    await fetch(
                        `${process.env.REACT_APP_SERVER_URL}/sets/updateLastValueForNextSet`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                userId: user.id,
                                exerciseId: setToUpdate.exercise_id,
                                setNumber: setNumber,
                                selectedDate: selectedDate,
                                newWeight: formattedWeight,
                                newReps: formattedReps,
                            }),
                        }
                    );
                    // Volver a cargar los ejercicios y sets después de la actualización
                    fetchExercisesAndSets();
                } else {
                    console.error("Failed to update set");
                }
            } catch (error) {
                console.error("Error updating set:", error);
            }
        }
    };

    // CARDIO INTERVALS

    const addInterval = async (exercise_id) => {
        if (isAddingInterval) return; // Evita clics dobles

        setIsAddingInterval(true); // Deshabilitar botón y mostrar spinner

        try {
            const newInterval = await createInterval(exercise_id);
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newInterval),
                }
            );

            if (response.ok) {
                const addedInterval = await response.json();
                setIntervals((prev) => [...prev, addedInterval]);
            }
        } catch (error) {
            console.error("Error al añadir intervalo:", error);
        } finally {
            setIsAddingInterval(false); // Reactivar botón
        }
    };

    // Crear interval
    async function createInterval(exercise_id) {
        // Filtrar los intervals que pertenecen a este ejercicio específico
        const exerciseIntervals = intervals.filter(
            (interval) => interval.exercise_id === exercise_id
        );
        const nextIntervalNumber = exerciseIntervals.length + 1;
        const lastValue = await getLastValueInterval(
            nextIntervalNumber,
            exercise_id,
            user.id
        );
        const interval = {
            exercise_id: exercise_id,
            interval_number: nextIntervalNumber,
            lastValue: lastValue,
            duration: null,
            distance: null,
        };
        return interval;
    }

    const updateInterval = (intervalId, field, value) => {
        // Actualizar el estado de intervals, modificando solo el campo especificado
        setIntervals((prevIntervals) =>
            prevIntervals.map((interval) =>
                interval.id === intervalId
                    ? { ...interval, [field]: value }
                    : interval
            )
        );
    };

    const finishInterval = async (
        intervalId,
        intervalNumber,
        updatedDuration,
        updatedDistance
    ) => {
        // Buscar el interval en la lista de intervals para obtener los detalles actuales
        const intervalToUpdate = intervals.find(
            (interval) => interval.id === intervalId
        );

        // Formatear y validar `updatedDuration`
        let formattedDuration = null;
        if (
            updatedDuration !== null &&
            updatedDuration !== undefined &&
            updatedDuration !== ""
        ) {
            formattedDuration = parseFloat(
                updatedDuration.toString().replace(",", ".")
            ).toFixed(2);
            if (isNaN(formattedDuration)) formattedDuration = null; // Asigna null si el resultado es NaN
        }

        // Formatear y validar `updatedDistance`
        let formattedDistance = null;
        if (
            updatedDistance !== null &&
            updatedDistance !== undefined &&
            updatedDistance !== ""
        ) {
            formattedDistance = parseFloat(
                updatedDistance.toString().replace(",", ".")
            ).toFixed(2);
            if (isNaN(formattedDistance)) formattedDistance = null; // Asigna null si el resultado es NaN
        }

        // Asegurarse de que se encontró el set
        if (intervalToUpdate) {
            // Llamar a la API para actualizar el set
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/intervals/updateInterval/${intervalId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            exercise_id: intervalToUpdate.exercise_id,
                            interval_number: intervalNumber,
                            duration: formattedDuration,
                            distance: formattedDistance,
                        }),
                    }
                );

                if (response.ok) {
                    const updatedInterval = await response.json();
                    // Actualizamos el lastValue del siguiente interval
                    await fetch(
                        `${process.env.REACT_APP_SERVER_URL}/intervals/updateLastValueForNextInterval`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                userId: user.id,
                                exerciseId: intervalToUpdate.exercise_id,
                                intervalNumber: intervalNumber,
                                selectedDate: selectedDate,
                                newDuration: formattedDuration,
                                newDistance: formattedDistance,
                            }),
                        }
                    );
                    // Volver a cargar los ejercicios e intervals después de la actualización
                    fetchExercisesAndIntervals();
                } else {
                    console.error("Failed to update interval");
                }
            } catch (error) {
                console.error("Error updating interval:", error);
            }
        }
    };

    const openExercises = () => {
        navigate("/exercises", {
            state: { selectedDate: selectedDate },
        });
    };

    const openExercisesCardio = () => {
        navigate("/exercisesCardio", {
            state: { selectedDate: selectedDate },
        });
    };

    const handleDeleteExercise = async (exerciseId) => {
        if (deletingExerciseId) return; // Evita múltiples clics
        setDeletingExerciseId(exerciseId);

        let exerciseToDelete = exercises.find(
            (exercise) => exercise.id === exerciseId
        );

        if (exerciseToDelete === undefined) {
            exerciseToDelete = exercisesCardio.find(
                (exercise) => exercise.id === exerciseId
            );
        }
        const formattedDate = formatLocalDate(selectedDate);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/exercises/deleteById/${exerciseId}?userId=${user.id}&selectedDate=${formattedDate}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const { exerciseType } = data;

                if (exerciseType === "Pesas") {
                    setExercises((prevExercises) =>
                        prevExercises.filter(
                            (exercise) => exercise.id !== exerciseId
                        )
                    );
                } else if (exerciseType === "Cardio") {
                    setExercisesCardio((prevExercises) =>
                        prevExercises.filter(
                            (exercise) => exercise.id !== exerciseId
                        )
                    );
                } else {
                    console.warn("Unknown exercise type:", exerciseType);
                }
                // Volver a cargar los ejercicios e intervals después de la actualización
                fetchExercisesAndIntervals();
            } else {
                console.error("Failed to delete exercise");
            }
        } catch (error) {
            console.error("Error deleting exercise:", error);
        } finally {
            setDeletingExerciseId(null);
        }
    };

    // const extractWeightAndReps = (inputString) => {
    //     // Usamos una expresión regular para capturar el peso y las repeticiones
    //     const regex = /^([\d.]+)kg\s*x\s*(\d+)$/;
    //     const match = inputString.match(regex);

    //     if (match) {
    //         // match[1] contiene el peso y match[2] contiene las repeticiones
    //         const formattedWeight = parseFloat(match[1]).toFixed(2); // Convertir el peso a número
    //         const formattedReps = parseInt(match[2], 10); // Convertir las repeticiones a entero
    //         return { formattedWeight, formattedReps };
    //     } else {
    //         // Si no hay coincidencia con el formato esperado, retornar null o valores por defecto
    //         return { formattedWeight: null, formattedReps: null };
    //     }
    // };

    const handleDeleteSet = async (setId) => {
        if (deletingSetId) return;
        setDeletingSetId(setId);

        const setToDelete = sets.find((set) => set.id === setId);

        try {
            // Actualizamos los valores de los sets de la misma instancia de ejercicio
            await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets/updateSetsFromSameExerciseId/${setToDelete.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error(
                "Error updating sets from same exercise by deleting set:",
                error
            );
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets/deleteById/${setId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setSets((prevSets) =>
                    prevSets.filter((set) => set.id !== setId)
                );
            } else {
                console.error("Failed to delete set");
            }
        } catch (error) {
            console.error("Error deleting set:", error);
        }

        try {
            // Actualizamos los lastValues de los sets de la siguiente instancia de ejercicio
            const response2 = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets/updateLastValuesForNextExercise`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        exerciseId: setToDelete.exercise_id,
                        selectedDate: selectedDate,
                    }),
                }
            );
            if (response2.ok) {
                fetchExercisesAndSets();
            } else {
                console.error("Failed to update lastValues for next exercise");
            }
        } catch (error) {
            console.error(
                "Error updating lastValues for next exercise by deleting set:",
                error
            );
        } finally {
            setDeletingSetId(null);
        }
    };

    const handleDeleteInterval = async (intervalId) => {
        if (deletingIntervalId) return;
        setDeletingIntervalId(intervalId);

        const intervalToDelete = intervals.find(
            (interval) => interval.id === intervalId
        );

        try {
            // Actualizamos los valores de los intervals de la misma instancia de ejercicio
            await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals/updateIntervalsFromSameExerciseId/${intervalToDelete.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error(
                "Error updating intervals from same exercise by deleting interval:",
                error
            );
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals/deleteById/${intervalId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setIntervals((prevIntervals) =>
                    prevIntervals.filter(
                        (interval) => interval.id !== intervalId
                    )
                );
            } else {
                console.error("Failed to delete interval");
            }
        } catch (error) {
            console.error("Error deleting interval:", error);
        }

        try {
            // Actualizamos los lastValues de los intervals de la siguiente instancia de ejercicio
            const response2 = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals/updateLastValuesForNextExercise`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        exerciseId: intervalToDelete.exercise_id,
                        selectedDate: selectedDate,
                    }),
                }
            );
            if (response2.ok) {
                fetchExercisesAndIntervals();
            } else {
                console.error("Failed to update lastValues for next exercise");
            }
        } catch (error) {
            console.error(
                "Error updating lastValues for next exercise by deleting interval:",
                error
            );
        } finally {
            setDeletingIntervalId(null);
        }
    };

    async function getLastValue(setNumber, exerciseId, userId) {
        try {
            const formattedDate = formatLocalDate(selectedDate);
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/sets/getLastValue?userId=${userId}&exerciseId=${exerciseId}&setNumber=${setNumber}&selectedDate=${formattedDate}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.weight == null || data.reps == null) {
                    return "-";
                } else {
                    return `${data.weight}kg x ${data.reps}`;
                }
            } else if (response.status === 404) {
                console.error("No hay ningún valor anterior");
                return "-";
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }

    async function getLastValueInterval(intervalNumber, exerciseId, userId) {
        try {
            const formattedDate = formatLocalDate(selectedDate);
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/intervals/getLastValue?userId=${userId}&exerciseId=${exerciseId}&intervalNumber=${intervalNumber}&selectedDate=${formattedDate}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.duration == null || data.distance == null) {
                    return "-";
                } else {
                    return `${data.distance}km en ${data.duration}min`;
                }
            } else if (response.status === 404) {
                console.error("No hay ningún valor anterior");
                return "-";
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }

    const updateExerciseNotes = (exerciseId, newNotes) => {
        // Actualizar las notas en el estado local
        setExercises((prevExercises) =>
            prevExercises.map((exercise) =>
                exercise.id === exerciseId
                    ? { ...exercise, notes: newNotes } // Actualiza las notas del ejercicio específico
                    : exercise
            )
        );
    };

    const saveExerciseNotes = async (exerciseId, notes) => {
        try {
            // Llamada a la API para guardar las notas en la base de datos o servidor
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/exercises/${exerciseId}/notes`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notes: notes,
                    }),
                }
            );

            if (response.ok) {
                const updatedExercise = await response.json();
            } else {
                console.error("Error al guardar las notas");
            }
        } catch (error) {
            console.error("Error al realizar la solicitud:", error);
        }
    };

    return (
        <div className="diary overflow-hidden">
            <div className="top fixed w-full">
                <Fecha
                    currentView={currentView}
                    isEditable={isEditable}
                    setIsEditable={setIsEditable}
                />
            </div>
            <div className="h-full mt-10 flex justify-center overflow-y-hidden">
                {currentView === "initial" && (
                    <div
                        className="initial flex flex-col items-center justify-center space-y-4"
                        style={{ height: "calc(100vh - 200px)" }}
                    >
                        <div className="pesas flex flex-col items-center justify-center text-white w-full px-8 py-4 text-2xl">
                            <button
                                className={`shadow-lg cursor-pointer mb-2 ${
                                    isPesasDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                onClick={openPesas}
                                disabled={isPesasDisabled}
                            >
                                <img
                                    src={BeastMode}
                                    alt="Pesas"
                                    className="w-48 responsive-initial-height"
                                />
                                {isLoadingPesas && (
                                    <div className="absolute flex items-center justify-center w-full h-full">
                                        <div className="spinner-border animate-spin text-white"></div>{" "}
                                        <FaSpinner className="animate-spin text-white text-2xl" />
                                    </div>
                                )}
                            </button>
                            Pesas
                        </div>
                        <div className="cardio flex flex-col items-center justify-center text-white w-full px-8 py-4 text-2xl">
                            <button
                                className={`shadow-lg cursor-pointer mb-2 ${
                                    isCardioDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                onClick={openCardio}
                                disabled={isCardioDisabled}
                            >
                                <img
                                    src={Cardio}
                                    alt="Cardio"
                                    className="w-48 responsive-initial-height"
                                />
                                {isLoadingCardio && (
                                    <div className="absolute flex items-center justify-center w-full h-full">
                                        <div className="spinner-border animate-spin text-white"></div>{" "}
                                        <FaSpinner className="animate-spin text-white text-2xl" />
                                    </div>
                                )}
                            </button>
                            Cardio
                        </div>
                    </div>
                )}
                {currentView === "pesas" && (
                    <div className="pesas overflow-y-auto flex flex-col w-full">
                        <div className="titulo text-center font-bold text-white text-xl mt-6 mb-6">
                            ENTRENAMIENTO DE PESAS
                        </div>

                        {exercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="text-white bg-neutral-700 rounded-3xl p-4 mb-4"
                            >
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <div className="font-bold text-lg">
                                        {exercise.exercise_name}
                                    </div>
                                    {isEditable && (
                                        <button
                                            onClick={() =>
                                                handleDeleteExercise(
                                                    exercise.id
                                                )
                                            }
                                            className="bg-red-700 text-white p-2 rounded"
                                            disabled={
                                                deletingExerciseId ===
                                                exercise.id
                                            }
                                        >
                                            {deletingExerciseId ===
                                            exercise.id ? (
                                                <FaSpinner className="animate-spin text-white text-xl" />
                                            ) : (
                                                <MdDeleteForever />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Campo de notas para el ejercicio */}
                                <div className="notas">
                                    <textarea
                                        placeholder="Introduce tus notas..."
                                        value={exercise.notes ?? ""}
                                        className="text-left w-full bg-neutral-600 text-white rounded-lg p-1"
                                        style={{
                                            resize: "vertical",
                                            lineHeight: "1.2", // Reducir el espacio entre las líneas de texto
                                        }}
                                        onChange={(e) =>
                                            updateExerciseNotes(
                                                exercise.id,
                                                e.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            saveExerciseNotes(
                                                exercise.id,
                                                exercise.notes
                                            )
                                        }
                                        rows={1} // Comienza con una fila
                                        onInput={(e) => {
                                            // Ajusta la altura para que se adapte al contenido
                                            e.target.style.height = "auto"; // Primero se restablece la altura
                                            e.target.style.height = `${e.target.scrollHeight}px`; // Luego se ajusta al scrollHeight
                                        }}
                                    />
                                </div>

                                {/* Tabla para los Sets */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center">
                                        <thead>
                                            <tr className="text-white border-b border-neutral-600">
                                                <th className="p-2">Set</th>
                                                <th className="p-2">
                                                    Anterior
                                                </th>
                                                <th className="p-2">
                                                    Peso (kg)
                                                </th>
                                                <th className="p-2">Reps</th>
                                                {isEditable && (
                                                    <th className="p-2">X</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sets
                                                .filter(
                                                    (set) =>
                                                        set.exercise_id ===
                                                        exercise.id
                                                )
                                                .map((set, index) => (
                                                    <tr
                                                        key={set.id}
                                                        className="border-b border-neutral-600 border-x"
                                                    >
                                                        <td className="p-2 border-neutral-600 border-x">
                                                            {index + 1}
                                                        </td>
                                                        <td className="p-2">
                                                            {set.lastValue ??
                                                                ""}
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="0"
                                                                value={
                                                                    set.weight ??
                                                                    ""
                                                                }
                                                                className="text-center w-full bg-neutral-600 text-white rounded-lg"
                                                                onChange={(e) =>
                                                                    updateSet(
                                                                        set.id,
                                                                        "weight",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    finishSet(
                                                                        set.id,
                                                                        index +
                                                                            1,
                                                                        set.reps,
                                                                        set.weight
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="0"
                                                                value={
                                                                    set.reps ??
                                                                    ""
                                                                }
                                                                className="text-center w-full bg-neutral-600 text-white rounded-lg"
                                                                onChange={(e) =>
                                                                    updateSet(
                                                                        set.id,
                                                                        "reps",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    finishSet(
                                                                        set.id,
                                                                        index +
                                                                            1,
                                                                        set.reps,
                                                                        set.weight
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        {isEditable && (
                                                            <td className="p-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteSet(
                                                                            set.id
                                                                        )
                                                                    }
                                                                    className="bg-red-700 text-white p-2 rounded"
                                                                    disabled={
                                                                        deletingSetId ===
                                                                        set.id
                                                                    }
                                                                >
                                                                    {deletingSetId ===
                                                                    set.id ? (
                                                                        <FaSpinner className="animate-spin text-white text-xl" />
                                                                    ) : (
                                                                        <MdDeleteForever />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="text-center">
                                    <button
                                        className="text-left text-white px-4 py-1 rounded-3xl mt-4"
                                        style={{ backgroundColor: "#890000" }}
                                        onClick={() => addSet(exercise.id)}
                                        disabled={isAddingSet} // Deshabilita el botón mientras se procesa
                                    >
                                        {isAddingSet ? (
                                            <FaSpinner className="animate-spin text-white text-lg" />
                                        ) : (
                                            "+ Agregar Set"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            className="bg-neutral-700 text-lg text-white rounded-3xl py-2 mt-4 w-full"
                            onClick={() => openExercises()}
                        >
                            + Agregar Ejercicio
                        </button>
                        <div className="finalSpace h-36"></div>
                    </div>
                )}
                {currentView === "cardio" && (
                    <div className="cardio flex flex-col w-full overflow-y-auto">
                        <div className="titulo text-center font-bold text-white text-xl mt-6 mb-6">
                            ENTRENAMIENTO DE CARDIO
                        </div>

                        {exercisesCardio.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="text-white bg-neutral-700 rounded-3xl p-4 mb-4"
                            >
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <div className="font-bold text-lg">
                                        {exercise.exercise_name}
                                    </div>
                                    {isEditable && (
                                        <button
                                            onClick={() =>
                                                handleDeleteExercise(
                                                    exercise.id
                                                )
                                            }
                                            className="bg-red-700 text-white p-2 rounded"
                                            disabled={
                                                deletingExerciseId ===
                                                exercise.id
                                            }
                                        >
                                            {deletingExerciseId ===
                                            exercise.id ? (
                                                <FaSpinner className="animate-spin text-white text-xl" />
                                            ) : (
                                                <MdDeleteForever />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Tabla para los Intervals */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center">
                                        <thead>
                                            <tr className="text-white border-b border-neutral-600">
                                                <th className="p-2">Int</th>
                                                <th className="p-2">
                                                    Anterior
                                                </th>
                                                <th className="p-2">
                                                    Distancia (km)
                                                </th>
                                                <th className="p-2">
                                                    Duración (min)
                                                </th>
                                                {isEditable && (
                                                    <th className="p-2">X</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {intervals
                                                .filter(
                                                    (interval) =>
                                                        interval.exercise_id ===
                                                        exercise.id
                                                )
                                                .map((interval, index) => (
                                                    <tr
                                                        key={interval.id}
                                                        className="border-b border-neutral-600 border-x"
                                                    >
                                                        <td className="p-2 border-neutral-600 border-x">
                                                            {index + 1}
                                                        </td>
                                                        <td className="p-2">
                                                            {interval.lastValue ??
                                                                ""}
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="0"
                                                                value={
                                                                    interval.distance ??
                                                                    ""
                                                                }
                                                                className="text-center w-full bg-neutral-600 text-white rounded-lg"
                                                                onChange={(e) =>
                                                                    updateInterval(
                                                                        interval.id,
                                                                        "distance",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    finishInterval(
                                                                        interval.id,
                                                                        index +
                                                                            1,
                                                                        interval.duration,
                                                                        interval.distance
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="0"
                                                                value={
                                                                    interval.duration ??
                                                                    ""
                                                                }
                                                                className="text-center w-full bg-neutral-600 text-white rounded-lg"
                                                                onChange={(e) =>
                                                                    updateInterval(
                                                                        interval.id,
                                                                        "duration",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    finishInterval(
                                                                        interval.id,
                                                                        index +
                                                                            1,
                                                                        interval.duration,
                                                                        interval.distance
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        {isEditable && (
                                                            <td className="p-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteInterval(
                                                                            interval.id
                                                                        )
                                                                    }
                                                                    className="bg-red-700 text-white p-2 rounded"
                                                                    disabled={
                                                                        deletingIntervalId ===
                                                                        interval.id
                                                                    }
                                                                >
                                                                    {deletingIntervalId ===
                                                                    interval.id ? (
                                                                        <FaSpinner className="animate-spin text-white text-xl" />
                                                                    ) : (
                                                                        <MdDeleteForever />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="text-center">
                                    <button
                                        className="text-left text-white px-4 py-1 rounded-3xl mt-4"
                                        style={{ backgroundColor: "#890000" }}
                                        onClick={() => addInterval(exercise.id)}
                                        disabled={isAddingInterval}
                                    >
                                        {isAddingInterval ? (
                                            <FaSpinner className="animate-spin text-white text-2xl" />
                                        ) : (
                                            "+ Agregar Intervalo"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            className="bg-neutral-700 text-lg text-white rounded-3xl py-2 mt-4 w-full"
                            onClick={() => openExercisesCardio()}
                        >
                            + Agregar Ejercicio
                        </button>
                        <div className="finalSpace h-36"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Diary;
