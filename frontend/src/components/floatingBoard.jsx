import React, { useState, useEffect, useRef, useCallback } from "react";
import alarmaSound from "../alarma.mp3";
import "boxicons";
import Itemlist from "./itemlist";
import { Link, useNavigate } from "react-router-dom";
import { BotonsMain } from "./botonsMain";
import axios from "axios";
import Report from "./report";
import Drivers from "./drivers";
import Commands from "./commands";

export function FloatingBoard({
  handleNotifications,
  fetchLocation,
  fetchSaveLocation,
  routesName,
  selectedRoute,
  setSelectedRoute,
  saveCRDatabase,
  eventChange,
  boardCommand,
}) {
  const API_URL = process.env.REACT_APP_MY_API_URL;
  const token = process.env.REACT_APP_MY_TOKEN_PASSWORD;
  const navigate = useNavigate();
  const Swal = require("sweetalert2");
  const username = localStorage.getItem("email");
  const password = localStorage.getItem("password");
  const authHeader = "Basic " + btoa(`${username}:${password}`);

  // Estados para el audio
  const [audioEnabled, setAudioEnabled] = useState(false);
  const soundAlarmRef = useRef(null);
  const userInteractedRef = useRef(false);
  const [audioStatus, setAudioStatus] = useState(
    "🔇 Haga clic para activar sonido"
  );

  // Estados de la interfaz
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(true);
  const [devices, setDevices] = useState([]);
  const [batteryLevels, setBatteryLevels] = useState({});
  const [lon, setlon] = useState({});
  const [lat, setlat] = useState({});
  const [min, setMin] = useState({});
  const [event, setEvent] = useState({});
  const [alarm, setAlarms] = useState({});
  const [drivers, setDrivers] = useState({});
  const [boardDevices, setBoardDevices] = useState("devices");
  const [boardRoutes, setBoardRoutes] = useState();
  const [boardReports, setBoardReports] = useState();
  const [boardDrivers, setBoardrivers] = useState();
  const [boardCommands, setboardCommands] = useState();
  const [allDrivers, setAllDrivers] = useState({});
  const [notifiedDevices, setNotifiedDevices] = useState(new Set());
  const [selectedDeviceForDriver, setSelectedDeviceForDriver] = useState("");
  const [commands, setcommands] = useState({});
  let advise = false;

  // Manejo de interacción del usuario para desbloquear audio
  const handleFirstInteraction = () => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      setAudioEnabled(true);
      setAudioStatus("🔊 Sonido activado");

      if (soundAlarmRef.current) {
        soundAlarmRef.current.volume = 0.1; // Volumen bajo para el "unlock"
        const playPromise = soundAlarmRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (soundAlarmRef.current) {
                soundAlarmRef.current.pause();
                soundAlarmRef.current.currentTime = 0;
              }
            })
            .catch((error) => {
              console.error("Error en reproducción inicial:", error);
              setAudioStatus("🔇 Error al activar sonido");
            });
        }
      }
    }
  };

  // Configurar listeners de interacción
  useEffect(() => {
    const interactionTypes = ["click", "keydown", "touchstart"];
    const handleInteraction = () => {
      handleFirstInteraction();
    };

    interactionTypes.forEach((type) => {
      document.addEventListener(type, handleInteraction);
    });

    return () => {
      interactionTypes.forEach((type) => {
        document.removeEventListener(type, handleInteraction);
      });
    };
  }, []);

  // Obtener lista de dispositivos
  const fetchDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: authHeader },
      });
      setDevices(response.data);
      fetchBatteryLevels(response.data);
      fetchPowerCut(response.data);
      fetchDriver(response.data);
      fetchEvents(response.data);
    } catch (error) {
      console.error("Error al obtener dispositivos:", error);
    }
  }, [authHeader]);

  /* Obtener todos los conductores*/
  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllDrivers(response.data);
    } catch (error) {
      console.error("Error al obtener conductores:", error);
    }
  };

  // Obtener conductores
  const fetchDriver = useCallback(
    async (devicesList) => {
      if (!token || devicesList.length === 0) return;
      const driver = {};

      for (const device of devicesList) {
        try {
          const response = await axios.get(
            `${API_URL}/drivers?deviceId=${device.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          driver[device.name] =
            response.data.length > 0
              ? response.data[0]
              : { name: "Sin conductor" };
        } catch (error) {
          console.error("Error al obtener los conductores:", error);
          driver[device.name] = { name: "Sin conductor" };
        }
      }
      setDrivers(driver);
    },
    [token]
  );

  // Obtener eventos
  const fetchEvents = useCallback(
    async (devicesList) => {
      if (!token || devicesList.length === 0) return;
      const events = {};
      const alarms = {};

      for (const device of devicesList) {
        try {
          const response = await axios.get(`${API_URL}/events/${device.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          events[device.name] = response.data.type;
          alarms[device.name] = response.data.attributes.alarm;
        } catch (error) {
          console.error(`Error al obtener evento de ${device.name}:`, error);
        }
      }
      setEvent(events);
      setAlarms(alarms);
    },
    [token]
  );

  // Manejar alarma de corte de energía
  const fetchPowerCut = useCallback(
    async (devicesList) => {
      if (!token || devicesList.length === 0) return;

      for (const device of devicesList) {
        try {
          const response = await axios.get(
            `${API_URL}/positions?deviceId=${device.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const eventsData = response.data[0]?.attributes?.alarm;

          if (eventsData && eventsData === "powerCut" && !advise) {
            if (soundAlarmRef.current && userInteractedRef.current) {
              try {
                soundAlarmRef.current.volume = 1;
                await soundAlarmRef.current.play();
                console.log("Alarma reproducida correctamente");
              } catch (error) {
                console.error("Error al reproducir alarma:", error);
                handleNotifications(
                  "Alarma",
                  `Dispositivo ${device.name} fue apagado (sonido no disponible)`
                );
              }
            } else {
              handleNotifications(
                "Alarma",
                `Dispositivo ${device.name} fue apagado (active el sonido)`
              );
            }

            advise = true;

            setTimeout(() => {
              Swal.fire({
                title: "PELIGRO",
                text: `El dispositivo ${device.name} fue apagado. ${
                  drivers[device.name]
                    ? "Llamar al conductor: " + drivers[device.name].name
                    : ""
                }`,
                icon: "warning",
              });
            }, 2000);
          }
        } catch (error) {
          console.error(`Error al obtener evento de ${device.name}:`, error);
        }
      }
      advise = false;
    },
    [token, drivers, handleNotifications]
  );

  // Obtener niveles de batería
  const fetchBatteryLevels = useCallback(
    async (devicesList) => {
      if (!token || devicesList.length === 0) return;
      const batteryData = {};
      const latitude = {};
      const longitud = {};
      const minuto = {};

      for (const device of devicesList) {
        try {
          const response = await axios.get(
            `${API_URL}/positions?deviceId=${device.id}`,
            {
              headers: { Authorization: authHeader },
            }
          );

          const data = response.data;
          if (
            data.length > 0 &&
            data[0].attributes?.batteryLevel !== undefined
          ) {
            const batteryLevel = data[0].attributes.batteryLevel;
            if (batteryLevel < 20) {
              setNotifiedDevices((prev) => new Set(prev).add(device.id));
            }

            batteryData[device.name] = data[0].attributes.batteryLevel;
            latitude[device.name] = data[0].latitude;
            longitud[device.name] = data[0].longitude;
            minuto[device.name] = new Date(data[0].fixTime);
          } else {
            batteryData[device.name] = "Sin datos";
            latitude[device.name] = "Sin datos";
            longitud[device.name] = "Sin datos";
            minuto[device.name] = null;
          }
        } catch (error) {}
      }

      setBatteryLevels(batteryData);
      setlon(longitud);
      setlat(latitude);
      setMin(minuto);
    },
    [authHeader, handleNotifications]
  );

  const handleSelected = (deviceName) => {
    setSelectedDeviceForDriver(deviceName);
    console.log("Dispositivo seleccionado para conductor:", deviceName);
  };

  // Manejar el borrar ruta
  const handleDeleteRoute = async (deviceName, deviceId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_MY_BACKEND_API}/device/route/${deviceId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_MY_TOKEN_PASSWORD}`,
          },
        }
      );

      // Actualizar la lista de dispositivos
      fetchDevices();

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Obtener todos los comandos
  const fetchAllCommands = async () => {
    try {
      const url = `${API_URL}/commands`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadCommand = async () => {
      const commandsRecibed = await fetchAllCommands();
      setcommands(commandsRecibed);
    };
    loadCommand();
  }, []);

  // Funciones de UI
  const handleText = (e) => setText(e.target.value);
  const handleMenu = () => setMenu(!menu);
  const handleCloseSession = async () => {
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Filtrar dispositivos
  const filteredDevices = text
    ? devices.filter((device) =>
        device.name.toLowerCase().includes(text.toLowerCase())
      )
    : devices;

  // Cargar dispositivos
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Cargar conductores
  useEffect(() => {
    fetchAllDrivers();
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  // Manejar eliminación de dispositivo
  const handleDeleteDevice = async () => {
    const { value: text } = await Swal.fire({
      title: "Ingrese el ID del dispositivo a eliminar:",
      input: "text",
      inputLabel: "ID del dispositivo",
      inputPlaceholder: "Escribe aquí...",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Debes escribir un nombre para la ruta";
      },
    });

    if (text) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_MY_BACKEND_API}/device/${text}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        Swal.fire({
          text: `Dispositivo eliminado: ${response.data.message}`,
          icon: "success",
        });
        fetchDevices();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Manejar paneles
  const handleBoardSelection = (board) => {
    setBoardDevices(board === "devices");
    setBoardReports(board === "reports");
    setBoardRoutes(board === "routes");
    setBoardrivers(board === "drivers");
    setboardCommands(board === "command");
  };

  // Limpiar notificaciones
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifiedDevices(new Set());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Manejar el seleccionado de la pantalla command
  useEffect(() => {
    if (boardCommand.name === "command") {
      handleBoardSelection(boardCommand.name);
    }
  }, [boardCommand]);

  return (
    <div className={menu ? "floatingBoard" : "floatingBoardHidden"}>
      {/* Elemento de audio */}
      <audio
        ref={soundAlarmRef}
        src={alarmaSound}
        preload="auto"
        loop={false}
      />
      {/* Indicador de estado de audio */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "14px",
          display: "none",
        }}
      >
        {audioStatus}
      </div>

      {/* Botón para activar sonido manualmente */}
      {!audioEnabled && (
        <button
          onClick={handleFirstInteraction}
          style={{
            position: "absolute",
            top: "40px",
            left: "10px",
            zIndex: 1000,
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            display: "none",
          }}
        >
          Activar Sonidos
        </button>
      )}

      <header>
        <div className="header-icons">
          <div className="package" onClick={handleMenu}>
            <i
              className="bx bx-package"
              style={{ color: "white", fontSize: "34px" }}
            ></i>
          </div>
          <input
            type="text"
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar dispositivo"
            value={text}
          />
          <div className="plus-icon" onClick={() => navigate("/addDevice")}>
            <i
              className="bx bx-plus"
              style={{ color: "white", fontSize: "34px" }}
            ></i>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="controlPanel">
          <i
            className="bx bx-devices"
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            onClick={() => handleBoardSelection("devices")}
          ></i>
          <i
            className="bx bx-taxi"
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            onClick={() => handleBoardSelection("routes")}
          ></i>
          <i
            className="bx bx-notepad"
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            onClick={() => handleBoardSelection("reports")}
          ></i>
          <i
            className="bx bx-user-circle"
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            onClick={() => handleBoardSelection("drivers")}
          ></i>
          <i
            className="bx bx-terminal"
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            onClick={() => handleBoardSelection("commands")}
          ></i>
          <Link
            to="/dashboardmain"
            onClick={() => {
              setSelectedRoute(null);
              setBoardDevices(true);
              setBoardRoutes(false);
              setBoardReports(false);
              setBoardrivers(false);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }}
          >
            <i
              className="bx bx-arrow-back"
              style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
            ></i>
          </Link>
        </div>
        {menu && (
          <div className="items-container">
            {boardDevices ? (
              <Itemlist
                batteryLevels={batteryLevels}
                device={filteredDevices}
                lat={lat}
                lon={lon}
                lastUpdateTime={min}
                event={event}
                alarm={alarm}
                driver={drivers}
                eventChange={eventChange}
                handleBoardSelection={handleBoardSelection}
                onDeviceSelect={handleSelected}
                onDeleteRoute={handleDeleteRoute}
              />
            ) : boardRoutes ? (
              <BotonsMain
                onSetRoute={fetchLocation}
                onSaveRoute={fetchSaveLocation}
                routes={routesName}
                selectedRoute={selectedRoute}
                onRouteChange={(e) => setSelectedRoute(e.target.value)}
                saveCRDatabase={saveCRDatabase}
              />
            ) : boardReports ? (
              <Report devices={devices} drivers={drivers} />
            ) : boardDrivers ? (
              <Drivers
                drivers={allDrivers}
                devices={devices}
                selectDevice={selectedDeviceForDriver}
              />
            ) : (
              <Commands
                devices={devices}
                selectedDevice={boardCommand}
                Allcommands={commands}
              />
            )}
          </div>
        )}
      </div>
      <footer>
        <div className="footer-icons">
          <div className="eliminar" onClick={handleDeleteDevice}>
            <i
              className="bx bx-trash"
              style={{ color: "white", fontSize: "34px" }}
            ></i>
          </div>
          <div className="closeSesion" onClick={handleCloseSession}>
            <i
              className="bx bx-door-open"
              style={{ color: "white", fontSize: "34px" }}
            ></i>
          </div>
        </div>
      </footer>
    </div>
  );
}
