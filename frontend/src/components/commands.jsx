import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Commands({ devices = [], selectedDevice = "", Allcommands = [] }) {
  const [command, setcommand] = useState();
  const [devicesSelected, setdevicesSelected] = useState();

    useEffect(() => {
      if (selectedDevice && Object.keys(selectedDevice).length !== 0) {
        setdevicesSelected(selectedDevice.data.name);
      }
    }, [selectedDevice]);

  const assignCommand = async(e) => {
    e.preventDefault();
    try {
        await axios.post(
          `${process.env.REACT_APP_MY_BACKEND_API}/device/assing-command`,
          { deviceName: devicesSelected, commandDescription: command },
          {
            headers: {
              "Content-Type": "application/json"
            },
          }
        );
  
        Swal.fire({
          title: "Éxito",
          text: "Comando agregado exitosamente",
          icon: "success",
        });
  
        setcommand("");
        setdevicesSelected("");
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

  return (
    <div className="assignCommand">
      <form onSubmit={assignCommand}>
        <p>Asignar comando</p>
        <select
          name="commands"
          onChange={(e) => setcommand(e.target.value)}
          value={command}
          required
        >
          <option value="">Selecciona un comando</option>
          {Allcommands.map((command) => (
            <option key={command.id} value={command.description}>
              {command.description}
            </option>
          ))}
        </select>
        <select
          name="devices"
          onChange={(e) => setdevicesSelected(e.target.value)}
          value={devicesSelected}
          required
        >
          <option value="">Selecciona un dispositivo</option>
          {devices.map((device) => (
            <option key={device.id} value={device.name}>
              {device.name}
            </option>
          ))}
        </select>
        <button type="submit">Asignar</button>
      </form>
    </div>
  );
}
