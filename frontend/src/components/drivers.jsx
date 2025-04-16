import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Drivers({ drivers = [], devices = [], selectDevice = "" }) {
  const [asignDriver, setAsignDriver] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [driverId, setDriverId] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(selectDevice);

  useEffect(() => {
    if (selectDevice) {
      setSelectedDevice(selectDevice);
    }
  }, [selectDevice]);

  const handleToggleAssign = (e) => {
    e.preventDefault();
    setAsignDriver(!asignDriver);
  };

  const AddDriver = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/device/drivers`,
        { driverName, driverId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_MY_BACKEND_API_TOKEN}`,
          },
        }
      );

      Swal.fire({
        title: "Éxito",
        text: "Conductor agregado exitosamente",
        icon: "success",
      });

      setDriverName("");
      setDriverId("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al agregar conductor";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  const assignDriverToDevice = async (e) => {
   
    e.preventDefault();
    try {
      
      await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/device/assign-driver`,
        { driverId: selectedDriver, deviceName: selectedDevice },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_MY_BACKEND_API_TOKEN}`,
          },
        }
      );
      Swal.fire({
        title: "Éxito",
        text: "Conductor asignado correctamente",
        icon: "success",
      });
    } catch (error) {
      console.error("Error completo:", error.response.data.message);

      Swal.fire({
        title: "Error",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };

  

  return (
    <div className="Alldrivers">
      <form onSubmit={AddDriver}>
        <p>Agregar conductor</p>
        <input
          type="text"
          placeholder="Nombre del conductor"
          onChange={(e) => setDriverName(e.target.value)}
          value={driverName}
          required
        />
        <input
          type="text"
          placeholder="Cédula"
          onChange={(e) => setDriverId(e.target.value)}
          value={driverId}
          required
        />
        <button type="submit">Agregar conductor</button>
      </form>

      <p onClick={handleToggleAssign} style={{ cursor: "pointer" }}>
        Asignar conductor{" "}
        {!asignDriver ? (
          <i className="bx bx-chevron-down"></i>
        ) : (
          <i className="bx bx-chevron-up"></i>
        )}
      </p>

      {asignDriver && (
        <form className="AsignDrive" onSubmit={assignDriverToDevice}>
          <select
            name="Drivers"
            onChange={(e) => setSelectedDriver(e.target.value)}
            value={selectedDriver}
            required
          >
            <option value="">Selecciona un conductor</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.uniqueId}>
                {driver.name} ({driver.uniqueId})
              </option>
            ))}
          </select>

          <select
            name="devices"
            onChange={(e) => setSelectedDevice(e.target.value)}
            value={selectedDevice}
            required
          >
            <option value="">Selecciona un dispositivo</option>
            {devices.map((device) => (
              <option key={device.id} value={device.name}>
                {device.name}
              </option>
            ))}
          </select>

          <button type="submit">Asignar dispositivo</button>
        </form>
      )}
    </div>
  );
}
