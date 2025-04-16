import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  Circle,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import Swal from "sweetalert2";

const Libraries = ["geometry", "places"];

const MapComponent = ({
  latitude,
  longitude,
  onSetRoute,
  startP,
  endP,
  params,
  deviceName,
  allDevices,
  devicesLat,
  devicesLon,
  routes,
  onEvent,
  commands
}) => {
  // Estados del mapa y rutas
  const [route, setRoute] = useState([]);
  const [alternateRoute, setAlternateRoute] = useState([]);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [directionsService, setDirectionsService] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startGeofence, setStartGeofence] = useState(null);
  const [endGeofence, setEndGeofence] = useState(null);
  const [deviceRoutes, setDeviceRoutes] = useState({});
  const [offRouteDevices, setOffRouteDevices] = useState([]);
  const [map, setMap] = useState(null);
  const [arrivedDevices, setArrivedDevices] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);


  // Estado para controlar el centro del mapa
  const defaultCenter = { lat: 18.488843, lng: -69.986673 }; // Coordenadas por defecto (Santo Domingo)
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const distanceThreshold = 50;
  const routeColors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
  ];

  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  const [geocoder, setGeocoder] = useState(null);

  // Inicializar servicios de Google Maps
  useEffect(() => {
    if (googleLoaded && window.google) {
      const ds = new window.google.maps.DirectionsService();
      setDirectionsService(ds);
      setGeocoder(new window.google.maps.Geocoder());
      calculateDeviceRoutes(ds);
    }
  }, [googleLoaded, routes]);

  // Funcion para calcular fin de la ruta
  const checkArrival = async (position, deviceId, deviceName) => {
    if (!window.google || !window.google.maps.geometry) return;

    const deviceRoute = deviceRoutes[deviceId];
    if (!deviceRoute) return;

    const deviceLatLng = new window.google.maps.LatLng(
      position.lat,
      position.lng
    );
    const endLatLng = new window.google.maps.LatLng(
      deviceRoute.end.lat,
      deviceRoute.end.lng
    );

    const distance =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        deviceLatLng,
        endLatLng
      );

    // Consideramos que ha llegado si está a menos de 50 metros del punto final
    const arrivalThreshold = 50; // metros

    if (distance <= arrivalThreshold) {
      if (!arrivedDevices.includes(deviceId)) {
        setArrivedDevices([...arrivedDevices, deviceId]);
        const eventData = {
          deviceName,
          data: `Dispositivo ha llegado al destino (${deviceRoute.routeName})`,
        };
        onEvent(eventData);

        try {
          // Llamar al endpoint del backend para manejar el fin de ruta
          const response = await axios.post(
            `${process.env.REACT_APP_MY_BACKEND_API}/device/end-route`,
            { deviceName, deviceId },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.REACT_APP_MY_TOKEN_PASSWORD}`,
              },
            }
          );

          // Mostrar notificación
          Swal.fire({
            title: "Llegada confirmada",
            text: `El dispositivo ${deviceName} ha llegado al destino final.`,
            icon: "success",
          });
        } catch (error) {
          console.error("Error al notificar llegada:", error);
          Swal.fire({
            title: "Error",
            text: `Error al registrar llegada: ${
              error.response?.data?.message || error.message
            }`,
            icon: "error",
          });
        }
      }
    } else {
      // Si se aleja del punto de destino después de haber llegado
      if (arrivedDevices.includes(deviceId)) {
        setArrivedDevices(arrivedDevices.filter((id) => id !== deviceId));
        const eventData = {
          deviceName,
          data: `Dispositivo se ha alejado del destino (${deviceRoute.routeName})`,
        };
        onEvent(eventData);
      }
    }
  };

  // Función para calcular rutas de dispositivos
  const calculateDeviceRoutes = (ds) => {
    if (!routes || !ds) return;

    const newDeviceRoutes = {};

    routes.forEach(async (device) => {
      if (!device?.route) return;

      const start = {
        lat: parseFloat(device.route.Startlatitud),
        lng: parseFloat(device.route.Startlongitud),
      };

      const end = {
        lat: parseFloat(device.route.Endlatitud),
        lng: parseFloat(device.route.Endlongitud),
      };

      try {
        const result = await new Promise((resolve, reject) => {
          ds.route(
            {
              origin: start,
              destination: end,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                resolve(result);
              } else {
                reject(status);
              }
            }
          );
        });

        const path = result.routes[0].overview_path.map((point) => ({
          lat: point.lat(),
          lng: point.lng(),
        }));

        newDeviceRoutes[device.id] = {
          path,
          start,
          end,
          name: device.name,
          routeName: device.route.rute_Name,
        };

        setDeviceRoutes({ ...newDeviceRoutes });
      } catch (error) {
        console.error(
          `Error al calcular ruta para dispositivo ${device.id}:`,
          error
        );
      }
    });
  };

  // Función para buscar direcciones
  const handleSearch = useCallback(() => {
    if (!geocoder || !searchQuery.trim()) return;

    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setSearchResults(results);
        setShowResults(true);

        if (map && results[0].geometry.location) {
          map.panTo(results[0].geometry.location);
          map.setZoom(16);
        }
      } else {
        setSearchResults([]);
        Swal.fire({
          title: "No se encontraron resultados",
          text: "Intenta con una dirección más específica",
          icon: "info",
        });
      }
    });
  }, [geocoder, searchQuery, map]);

  const getValidCoordinates = (device) => {
    const lat = devicesLat[device.name]
      ? parseFloat(devicesLat[device.name])
      : null;
    const lng = devicesLon[device.name]
      ? parseFloat(devicesLon[device.name])
      : null;
    return { lat, lng };
  };

  // Manejar selección de resultado de búsqueda
  const handleSelectResult = (result) => {
    const location = result.geometry.location;
    const selectedLocation = {
      lat: location.lat(),
      lng: location.lng(),
    };

    if (map) {
      map.panTo(location);
      map.setZoom(16);
    }

    setSearchQuery(result.formatted_address);
    setShowResults(false);

    if (!startPoint) {
      setStartPoint(selectedLocation);
      setStartGeofence({
        center: selectedLocation,
        radius: 100,
      });
    } else if (!endPoint) {
      setEndPoint(selectedLocation);
      setEndGeofence({
        center: selectedLocation,
        radius: 100,
      });
      calculateRoute(startPoint, selectedLocation);
      calculateRoute(startPoint, selectedLocation, true, false);
    }
  };

  // Calcular la ruta
  const calculateRoute = useCallback(
    (start, end, avoidHighways = false, avoidTolls = false) => {
      if (!directionsService) return;

      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: window.google.maps.TravelMode.DRIVING,
          avoidHighways: avoidHighways,
          avoidTolls: avoidTolls,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const newPath = result.routes[0].overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));

            if (avoidHighways || avoidTolls) {
              setAlternateRoute(newPath);
            } else {
              setRoute(newPath);
            }
          } else {
            console.error("Error al calcular la ruta:", status);
          }
        }
      );
    },
    [directionsService]
  );

  // Actualizar el centro cuando cambian las coordenadas
  useEffect(() => {
    if (latitude && longitude) {
      const newCenter = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      };
      setMapCenter(newCenter);
      if (map) {
        map.panTo(newCenter);
      }
    }
  }, [latitude, longitude, map]);

  // Funcion para el arrastre de las rutas
  const handleMarkerDragEnd = useCallback(
    async (event, markerType, deviceId = null) => {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      const updatedRoute = { ...deviceRoutes[deviceId] };
      if (deviceId) {
        // Estamos editando una ruta de dispositivo

        if (markerType === "start") {
          updatedRoute.start = newPosition;
        } else if (markerType === "end") {
          updatedRoute.end = newPosition;
        }

        // Recalcular la ruta
      } else {
        // Estamos editando la ruta temporal
        if (markerType === "start") {
          setStartPoint(newPosition);
          setStartGeofence({
            center: newPosition,
            radius: 100,
          });
          if (endPoint) {
            calculateRoute(newPosition, endPoint);
            calculateRoute(newPosition, endPoint, true, false);
            if (onSetRoute) onSetRoute(newPosition, endPoint);
          }
        } else if (markerType === "end") {
          setEndPoint(newPosition);
          setEndGeofence({
            center: newPosition,
            radius: 100,
          });
          if (startPoint) {
            calculateRoute(startPoint, newPosition);
            calculateRoute(startPoint, newPosition, true, false);
            if (onSetRoute) onSetRoute(startPoint, newPosition);
          }
        }
        console.log("Recalculando");
        try {
          const result = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: startP,
                destination: endP,
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  resolve(result);
                } else {
                  reject(status);
                }
              }
            );
          });

          updatedRoute.path = result.routes[0].overview_path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }));

          // Actualizar el estado
          setDeviceRoutes((prev) => ({
            ...prev,
            [deviceId]: updatedRoute,
          }));
          console.log("Inicio", startP);
          console.log("Final", endP);
          console.log(deviceName);

          const newRouteData = {
            Startlatitud: startP.lat,
            Startlongitud: startP.lng,
            Endlatitud: endP.lat,
            Endlongitud: endP.lng,
          };
          // Actualizar en el backend
          try {
            await axios.put(
              `${process.env.REACT_APP_MY_BACKEND_API}/routes/${deviceName}`,
              newRouteData,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.REACT_APP_MY_TOKEN_PASSWORD}`,
                },
              }
            );

            Swal.fire({
              title: "¡Ruta actualizada!",
              text: "La ruta se ha modificado correctamente",
              icon: "success",
            });
          } catch (error) {
            console.error("Error al actualizar ruta:", error);
            Swal.fire({
              title: "Error",
              text: `No se pudo actualizar la ruta: ${
                error.response?.data?.message || error.message
              }`,
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error al recalcular ruta:", error);
        }
      }
    },
    [deviceRoutes, directionsService, routes, calculateRoute, onSetRoute]
  );

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  // Efectos para manejar puntos de inicio/fin
  useEffect(() => {
    if (!startP || !endP) {
      setRoute([]);
      setAlternateRoute([]);
      setStartPoint(null);
      setEndPoint(null);
      setStartGeofence(null);
      setEndGeofence(null);
    }
  }, [startP, endP]);

  useEffect(() => {
    if (params && startP && endP) {
      setRoute([]);
      setAlternateRoute([]);
      setStartPoint(startP);
      setEndPoint(endP);
      calculateRoute(startP, endP);
      setStartGeofence({
        center: startP,
        radius: 100,
      });
      setEndGeofence({
        center: endP,
        radius: 100,
      });
      calculateRoute(startP, endP, true, false);
    }
  }, [params, startP, endP, calculateRoute]);

  // Función para verificar si el dispositivo está fuera de la ruta
  const checkIfOffRoute = (position, deviceId = null, deviceName = null) => {
    if (!window.google || !window.google.maps.geometry) return;

    if (deviceId === null && route.length > 0) {
      let closestDistance = Infinity;

      route.forEach((point) => {
        const pointLatLng = new window.google.maps.LatLng(point.lat, point.lng);
        const deviceLatLng = new window.google.maps.LatLng(
          position.lat,
          position.lng
        );
        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            deviceLatLng,
            pointLatLng
          );

        if (distance < closestDistance) {
          closestDistance = distance;
        }
      });

      if (deviceName !== null && closestDistance > distanceThreshold) {
        Swal.fire({
          title: "Peligro",
          text: `Dispositivo ${deviceName} fuera de ruta`,
          icon: "warning",
        });
      }
      return;
    }

    const deviceRoute = deviceRoutes[deviceId];
    if (!deviceRoute) return;

    let closestDistance = Infinity;
    deviceRoute.path.forEach((point) => {
      const pointLatLng = new window.google.maps.LatLng(point.lat, point.lng);
      const deviceLatLng = new window.google.maps.LatLng(
        position.lat,
        position.lng
      );
      const distance =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          deviceLatLng,
          pointLatLng
        );

      if (distance < closestDistance) {
        closestDistance = distance;
      }
    });

    if (closestDistance > distanceThreshold) {
      if (deviceName !== null && !offRouteDevices.includes(deviceId)) {
        setOffRouteDevices([...offRouteDevices, deviceId]);
        const eventData = { deviceName, data: `Dispositivo fuera de ruta` };
        onEvent(eventData);
      }
    } else {
      setOffRouteDevices(offRouteDevices.filter((id) => id !== deviceId));
    }
  };

  // Efectos para verificar rutas
  useEffect(() => {
    if (!googleLoaded || !allDevices) return;

    allDevices.forEach((device) => {
      const { lat, lng } = getValidCoordinates(device);
      if (lat && lng) {
        checkIfOffRoute({ lat, lng }, device.id, device.name);
        checkArrival({ lat, lng }, device.id, device.name);
      }
    });
  }, [googleLoaded, allDevices, deviceRoutes]);

  useEffect(() => {
    if (latitude && longitude && route.length > 0) {
      checkIfOffRoute({ lat: latitude, lng: longitude }, null, deviceName);
    }
  }, [latitude, longitude, route, deviceName]);

  useEffect(() => {
    if (latitude && longitude && params) {
      checkIfOffRoute({ lat: latitude, lng: longitude }, null, deviceName);

      // Verificar llegada para el dispositivo seleccionado
      if (deviceName && routes) {
        const deviceRoute = routes.find((r) => r.name === deviceName);
        if (deviceRoute?.route) {
          checkArrival(
            { lat: parseFloat(latitude), lng: parseFloat(longitude) },
            deviceRoute.id,
            deviceName
          );
        }
      }
    }
  }, [latitude, longitude, deviceName]);

  // Manejo de clicks en el mapa
  const handleMapClick = (event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    if (!startPoint) {
      setStartPoint(clickedLocation);
      setStartGeofence({ center: clickedLocation, radius: 100 });
    } else if (!endPoint) {
      setRoute([]);
      setAlternateRoute([]);
      setEndPoint(clickedLocation);
      setEndGeofence({ center: clickedLocation, radius: 100 });
      calculateRoute(startPoint, clickedLocation);
      calculateRoute(startPoint, clickedLocation, true, false);
      if (onSetRoute) onSetRoute(startPoint, clickedLocation);
    }
  };

  const resetPoints = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute([]);
    setStartGeofence(null);
    setEndGeofence(null);
    setAlternateRoute([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={Libraries}
      onLoad={() => setGoogleLoaded(true)}
    >
      {/* UI del buscador y botones */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          width: "400px",
          maxWidth: "80%",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar dirección..."
            style={{
              padding: "10px 15px",
              width: "100%",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              fontSize: "16px",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-search"></i>
          </button>

          {showResults && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: "0 0 5px 5px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                maxHeight: "300px",
                overflowY: "auto",
                zIndex: 1001,
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    ":hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  {result.formatted_address}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{ position: "absolute", top: "150px", right: "10px", zIndex: 3 }}
      >
        <button
          onClick={resetPoints}
          style={{
            padding: "10px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reiniciar puntos
        </button>
      </div>

      {/* Mapa principal */}
      {googleLoaded ? (
        <GoogleMap
          center={mapCenter}
          zoom={14}
          mapContainerStyle={{ height: "100vh", width: "100%" }}
          onClick={handleMapClick}
          onLoad={(map) => {
            setMap(map);
            // Centrar en dispositivo seleccionado o ubicación por defecto
            if (latitude && longitude) {
              map.panTo({
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
              });
            } else {
              map.panTo(defaultCenter);
            }
          }}
          options={{
            disableDefaultUI: true,
            gestureHandling: "greedy",
          }}
        >
          {/* Rutas de dispositivos */}
          {!deviceName &&
            Object.values(deviceRoutes).map((deviceRoute, index) => (
              <React.Fragment key={`route-${deviceRoute.name}-${index}`}>
                <Polyline
                  path={deviceRoute.path}
                  options={{
                    strokeColor: routeColors[index % routeColors.length],
                    strokeWeight: 4,
                    strokeOpacity: 0.7,
                  }}
                />
                <Marker
                  position={deviceRoute.start}
                  key={`start-marker-${deviceRoute.name}`}
                  label={{
                    text: `Inicio ${deviceRoute.name}`,
                    className: "marker-label-dark",
                  }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />
                <Marker
                  position={deviceRoute.end}
                  label={{
                    text: `Fin ${deviceRoute.name}`,
                    className: "marker-label-dark",
                  }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />
                {deviceRoute.routeName && (
                  <Marker
                    label={{
                      text: deviceRoute.routeName,
                      className: "marker-label-dark",
                    }}
                    position={{
                      lat: (deviceRoute.start.lat + deviceRoute.end.lat) / 2,
                      lng: (deviceRoute.start.lng + deviceRoute.end.lng) / 2,
                    }}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      scaledSize: new window.google.maps.Size(25, 25),
                    }}
                  />
                )}
              </React.Fragment>
            ))}

          {/* Marcadores de todos los dispositivos */}
          {allDevices?.map((device) => {
            const { lat, lng } = getValidCoordinates(device);
            if (!lat || !lng) return null;           
            return (
              <>
                <Marker
                  key={`marker-${device.id}`}
                  position={{ lat, lng }}
                  label={{ text: device.name, className: "marker-label-dark" }}
                  title={device.name}
                  icon={{
                    url: offRouteDevices.includes(device.id)
                      ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  onClick={() => handleMarkerClick(device.id)}
                />
                {selectedMarker === device.id && (
                  <InfoWindow
                    position={{ lat, lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #444",
                          fontSize: "16px",
                        }}
                      >
                        {device.name}
                      </h3>
                        <div className="infoWindow">
                          <div className="group">
                            <p>{`Id:`}</p>
                            <p>{`${device.id}`}</p>
                          </div>
                          <div className="group">
                            <p>{`Desabilitado:`}</p>
                            <p>{`${device.disabled}`}</p>
                          </div>
                          <div className="group">
                            <p>{`Estado:`}</p>
                            <p>{`${device.status}`}</p>
                          </div>
                          <div className="group-icons">
                          <i className='bx bx-qr-scan' onClick={() => commands({name: "settings", data:device })}></i>
                          <i className='bx bx-terminal' onClick={() => commands({name: "command", data:device })}></i>
                          </div>
                        </div>
                    </>
                  </InfoWindow>
                )}
              </>
            );
          })}

          {/* Geofences y rutas */}
          {startGeofence && (
            <Circle
              center={startGeofence.center}
              radius={startGeofence.radius}
              options={{
                strokeColor: "#00FF00",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#00FF00",
                fillOpacity: 0.2,
              }}
            />
          )}

          {endGeofence && (
            <Circle
              center={endGeofence.center}
              radius={endGeofence.radius}
              options={{
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.2,
              }}
            />
          )}

          {route.length > 0 && (
            <Polyline
              path={route}
              options={{ strokeColor: "green", strokeWeight: 2 }}
            />
          )}

          {alternateRoute.length > 0 && (
            <Polyline
              path={alternateRoute}
              options={{ strokeColor: "blue", strokeWeight: 2 }}
            />
          )}

          {/* Puntos de inicio/fin */}
          {startPoint && (
            <Marker
              position={startPoint}
              label={{ text: "Inicio", className: "marker-label-dark" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {endPoint && (
            <Marker
              position={endPoint}
              label={{ text: "Fin", className: "marker-label-dark" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Dispositivo seleccionado */}
          {latitude && longitude && params && (
            <Marker
              position={{
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
              }}
              label={{ text: deviceName, className: "marker-label-dark" }}
              title={deviceName}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
          {startPoint && (
            <Marker
              position={startPoint}
              label={{ text: "Inicio", className: "marker-label-dark" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              draggable={true}
              onDragEnd={(e) => handleMarkerDragEnd(e, "start")}
            />
          )}

          {endPoint && (
            <Marker
              position={endPoint}
              label={{ text: "Fin", className: "marker-label-dark" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              draggable={true}
              onDragEnd={(e) => handleMarkerDragEnd(e, "end")}
            />
          )}
        </GoogleMap>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
            color: "#555",
          }}
        >
          Cargando Google Maps...
        </div>
      )}
    </LoadScript>
  );
};

export default MapComponent;
