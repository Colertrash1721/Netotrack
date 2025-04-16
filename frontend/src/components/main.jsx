import React, { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { FloatingBoard } from "./floatingBoard";
import "../style/main.css";
import MapComponent from "./google";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// SWR fetcher function
const fetcher = (url, token) =>
  axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

export function Main() {
  const navigate = useNavigate();

  const { name: deviceName } = useParams();
  const { id: deviceId } = useParams();

  const API_URL = process.env.REACT_APP_MY_API_URL;
  const token = process.env.REACT_APP_MY_TOKEN_PASSWORD;

  const [routes, setRoutes] = useState([]);
  const [routesName, setRoutesName] = useState([]);
  const [lon, setLon] = useState({});
  const [lat, setLat] = useState({});
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [params, setParams] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("Saved routes");
  const [refreshMap, setRefreshMap] = useState(0);
  const [notifications, setNotification] = useState("");
  const [mapEvent, setMapEvent] = useState(null);
  const [command, setcommand] = useState({})

  const username = localStorage.getItem("email");
  const password = localStorage.getItem("password");
  const authHeader = "Basic " + btoa(`${username}:${password}`);
  

  // SWR hooks for data fetching
  const {
    data: devices,
    error: devicesError,
    mutate: mutateDevices,
  } = useSWR(
    deviceName
      ? `${API_URL}/devices?uniqueId=${deviceName}`
      : `${API_URL}/devices`,
    (url) =>
      fetch(url, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      refreshInterval: 60000,
      onSuccess: (data) => {
        if (data) fetchLocations(data);
      },
    }
  );

  const { data: concurrentRoutesData, mutate: mutateConcurrentRoutes } = useSWR(
    `${process.env.REACT_APP_MY_BACKEND_API}/routes/concurrent`,
    (url) => axios.get(url).then((res) => res.data),
    {
      revalidateIfStale: false, // No revalidar si los datos están en cache
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (data) {
          setRoutes(data);
          setRoutesName(data.map((route) => route.routeName));
        }
      },
    }
  );

  const { data: deviceRoute, mutate: mutateDeviceRoute } = useSWR(
    deviceName
      ? `${process.env.REACT_APP_MY_BACKEND_API}/routes/${deviceName}`
      : null,
    (url) => axios.get(url).then((res) => res.data),
    {
      revalidateIfStale: false, // No revalidar si los datos están en cache
      revalidateOnFocus: false,
    }
  );

  const { data: allRoutes } = useSWR(
    !deviceName ? `${process.env.REACT_APP_MY_BACKEND_API}/routes/` : null,
    (url) => axios.get(url).then((res) => res.data),
    {
      revalidateIfStale: false, // No revalidar si los datos están en cache
      revalidateOnFocus: false,
    }
  );

  // Effect to handle device route data
  useEffect(() => {
    if (deviceRoute) {
      if (
        deviceRoute.device &&
        deviceRoute.device.Startlatitud &&
        deviceRoute.device.Startlongitud
      ) {
        const startLat = parseFloat(deviceRoute.device.Startlatitud);
        const startLng = parseFloat(deviceRoute.device.Startlongitud);
        const endLat = parseFloat(deviceRoute.device.Endlatitud);
        const endLng = parseFloat(deviceRoute.device.Endlongitud);

        setStartPoint({ lat: startLat, lng: startLng });
        setEndPoint({ lat: endLat, lng: endLng });
      } else {
        setStartPoint(null);
        setEndPoint(null);
      }
    }
  }, [deviceRoute]);

  // Función para enviar las rutas a la base de datos
  const fetchLocation = async () => {
    if (!startPoint || !endPoint) {
      Swal.fire({
        title: "Error",
        text: "Por favor selecciona las rutas",
        icon: "error",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/routes`,
        {
          rute_Name: "",
          device_Name: deviceName.toString(),
          Startlatitud: startPoint.lat.toString(),
          Startlongitud: startPoint.lng.toString(),
          Endlatitud: endPoint.lat.toString(),
          Endlongitud: endPoint.lng.toString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await Swal.fire({
        title: "¿Desea guardar la ruta como concurrente?",
        text: "No será capaz de revertirlo",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        const { value: text } = await Swal.fire({
          title: "Ingresa el nombre de la ruta",
          input: "text",
          inputLabel: "Nombre de la ruta",
          inputPlaceholder: "Escribe aquí...",
          showCancelButton: true,
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          inputValidator: (value) => {
            if (!value) {
              return "Debes escribir un nombre para la ruta";
            }
          },
        });

        if (text) {
          await concurrentRoutes(startPoint, endPoint, text);
        }

        Swal.fire({
          title: "Bien hecho",
          text: "Ruta enviada exitosamente",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error al enviar la ruta:", error.response?.data?.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  const saveCR = async () => {
    if (!startPoint || !endPoint) {
      Swal.fire({
        title: "Error",
        text: "Por favor selecciona las rutas",
        icon: "error",
      });
      return;
    }

    try {
      const { value: text } = await Swal.fire({
        title: "Ingresa el nombre de la ruta",
        input: "text",
        inputLabel: "Nombre de la ruta",
        inputPlaceholder: "Escribe aquí...",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (!value) {
            return "Debes escribir un nombre para la ruta";
          }
        },
      });

      if (text) {
        await concurrentRoutes(startPoint, endPoint, text);
      }

      Swal.fire({
        title: "Bien hecho",
        text: "Ruta enviada exitosamente",
        icon: "success",
      });
    } catch (error) {
      console.error("Error al crear la ruta:", error.response?.data?.message);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  // Función para guardar las rutas concurrentes
  const concurrentRoutes = async (startPoint, endPoint, text) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/routes/concurrent`,
        {
          routeName: text.toString(),
          Startlatitud: startPoint.lat.toString(),
          Startlongitud: startPoint.lng.toString(),
          Endlatitud: endPoint.lat.toString(),
          Endlongitud: endPoint.lng.toString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Revalidate the concurrent routes list
      mutateConcurrentRoutes();

      Swal.fire({
        title: "Bien hecho",
        text: `Ruta enviada exitosamente ${response.data}`,
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  // Función para obtener las ubicaciones de los dispositivos
  const fetchLocations = useCallback(
    async (devicesList) => {
      if (!token || !devicesList || devicesList.length === 0) return;

      const latitude = {};
      const longitud = {};

      for (const device of devicesList) {
        try {
          const response = await axios.get(
            `${API_URL}/positions?deviceId=${device.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
              },
            }
          );
          const data = response.data;
          if (
            data.length > 0 &&
            data[0].attributes?.batteryLevel !== undefined
          ) {
            latitude[device.name] = data[0].latitude;
            longitud[device.name] = data[0].longitude;
          } else {
            latitude[device.name] = "Sin datos";
            longitud[device.name] = "Sin datos";
          }
        } catch (error) {}
      }

      setLon(longitud);
      setLat(latitude);
    },
    [API_URL, token]
  );

  const getDevicesWithRoutes = useCallback(() => {
    if (!devices || !allRoutes) return null;

    return devices.map((device) => {
      const deviceRoute = allRoutes.find(
        (route) => route.device_Name === device.name
      );
      return {
        ...device,
        route: deviceRoute || null,
      };
    });
  }, [devices, allRoutes]);

  // Función para obtener las ubicaciones guardadas
  const fetchSaveLocation = async () => {
    if (selectedRoute === "Saved routes" || selectedRoute === "") {
      return Swal.fire({
        title: "Error",
        text: `Seleccione una ruta antes de guardarla`,
        icon: "error",
      });
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/routes/${selectedRoute}/${deviceName}`
      );

      if (response.data && response.data.message) {
        Swal.fire({
          title: "Success",
          text: response.data.message,
          icon: "success",
        });

        // Revalidate the device route
        mutateDeviceRoute();

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        Swal.fire({
          title: "Error",
          text: "La respuesta de la API no tiene la estructura esperada",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error handling route:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  // Efecto para verificar el token de autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Efecto para establecer params cuando hay un deviceName
  useEffect(() => {
    if (deviceName) {
      setParams(true);
      mutateDevices(undefined, { revalidate: true }).then(() => {
        if (devices) fetchLocations(devices);
      });
    }
  }, [deviceName, mutateDevices]);

  // Función para recibir los puntos de inicio y fin desde MapComponent
  const handleRoutePoints = (start, end) => {
    setStartPoint(start);
    setEndPoint(end);
  };

  // Funcion para recibir si los iconos de MapComponent fueron tocados
  const handleOptionMap = (command) =>{
    setcommand(command)
  }


  // Funcion para recibir las notificaciones
  const handleNotifications = (titulo, notification) => {
    setNotification(titulo, notification);
    Swal.fire({
      title: titulo,
      text: notification,
      icon: "warning",
    });
  };

  // Limpiar peticiones antiguas cada 6 horas
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Mostrar alerta 10 segundos antes del reinicio
      Swal.fire({
        title: "Atención",
        html: "La aplicación se reiniciará en <b>20 segundos</b> para actualizar los datos",
        icon: "info",
        timer: 10000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // También puedes usar setTimeout para mayor precisión
      setTimeout(() => {
        window.location.reload();
      }, 3 * 60 * 60 * 1000);
    }, 3 * 60 * 60 * 1000 - 20000);

    return () => clearInterval(intervalId);
  }, []);

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos por defecto

useEffect(() => {
  const intervalId = setInterval(() => {
    // Actualizar dispositivos y posiciones
    mutateDevices();
    fetchLocations(devices);
    
    // Si hay un dispositivo específico seleccionado, actualizar su ruta
    if (deviceName) {
      mutateDeviceRoute();
    }
  }, refreshInterval);

  return () => clearInterval(intervalId);
}, [refreshInterval, devices, deviceName, mutateDevices, mutateDeviceRoute, fetchLocations]);

  const currentLatitude =
    devices && devices.length > 0 ? lat[devices[0].name] : null;
  const currentLongitude =
    devices && devices.length > 0 ? lon[devices[0].name] : null;

  const handleMapEvent = (event) => setMapEvent(event);

  return (
    <div className="containerMain">
      <div className="containerMap">
        <MapComponent
          latitude={currentLatitude}
          longitude={currentLongitude}
          onSetRoute={handleRoutePoints}
          startP={startPoint}
          endP={endPoint}
          params={params}
          refreshMap={refreshMap}
          handleNotifications={handleNotifications}
          idDevice={deviceId}
          deviceName={deviceName}
          allDevices={!deviceName ? devices : null}
          devicesLat={lat}
          devicesLon={lon}
          routes={!deviceName ? getDevicesWithRoutes() : null}
          onEvent={handleMapEvent}
          commands={handleOptionMap}
        />
      </div>
      <div className="board">
        <FloatingBoard
          handleNotifications={handleNotifications}
          deviceName={deviceName}
          fetchLocation={fetchLocation}
          fetchSaveLocation={fetchSaveLocation}
          routesName={routesName}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
          saveCRDatabase={saveCR}
          eventChange={mapEvent}
          boardCommand={command}
        />
      </div>
    </div>
  );
}
