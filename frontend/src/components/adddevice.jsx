import { React, useState } from "react";
import "../style/device.css";
import Icons from "./icons";
import Darkmode from "./darkmode";
import { Link } from "react-router-dom";

export function AddDevice() {
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceNumber, setDeviceNumber] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceContact, setDeviceContact] = useState("");
  const [showFormExtra, setShowFormExtra] = useState(false);
  const Swal = require("sweetalert2");

  const toggleExtraContent = () => {
    setShowFormExtra(!showFormExtra);
  };

  const handlePost = async (e) => {
    e.preventDefault();

    const deviceData = {
      name: deviceName,
      uniqueId: deviceId,
      phone: deviceNumber,
      model: deviceModel,
      contact: deviceContact,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_MY_BACKEND_API}/device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      Swal.fire({
        text: "Dispositivo agregado",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        text: `Error al agregar el dispositivo ${error.message}`,
        icon: "error"
      });
    }
  };

  return (
    <div className="addDevices">
      <Darkmode />
      <div className="containerDevices">
        <header>
          <div className="titleDevice">
            <h1>Agregar un dispositivo</h1>
          </div>
          <div className="goBack">
            <Icons name="left-arrow-alt" size="md" color="black" />
            <h1><Link to="/dashboardmain">Volver</Link></h1>
          </div>
        </header>
        <form onSubmit={handlePost} className="formAdd">
          <input
            type="text"
            placeholder="Nombre"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Identificación"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <div className="extras" onClick={toggleExtraContent}>
            <a href="#">Extras</a>
            <Icons
              name={showFormExtra ? "chevron-up" : "chevron-down"}
              size="md"
              color="black"
            />
          </div>
          {!showFormExtra && (
            <div className="Content-extra">
              <div className="content-left">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={deviceNumber}
                  onChange={(e) => setDeviceNumber(e.target.value)}
                />
              </div>
              <div className="content-right">
                <input
                  type="text"
                  placeholder="Contacto"
                  value={deviceContact}
                  onChange={(e) => setDeviceContact(e.target.value)}
                />
              </div>
                <input
                  type="text"
                  placeholder="Modelo"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                />
            </div>
          )}
          <button type="submit">
            <span>AGREGAR</span>
          </button>
        </form>
      </div>
    </div>
  );
}