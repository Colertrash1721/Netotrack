import { React, useState } from "react";
import "../style/main.css";
import Icons from "./icons";
import axios from "axios";

export default function Report({ devices, drivers }) {
  const [onInput, setOnInput] = useState(false);
  const [routeDate, setrouteDate] = useState();
  const [files, setFiles] = useState({
    colocacion: [],
    viaje: [],
    llegada: [],
    apertura: [],
  });
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

  const handleSelectDevice = async (e) => {
    
    const deviceId = e.target.value;
    try {
      const response = await axios.get(`${process.env.REACT_APP_MY_BACKEND_API}/routes/${deviceId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      const routeCreationDate = response.data.device.creationDate.split('T')[0]
      console.log("Datos de la ruta:", routeCreationDate);
      setData(prev => ({
        ...prev,
        dateReport: routeCreationDate || prev.dateReport,
        dateColocation: routeCreationDate || prev.dateReport, // Mantener valor anterior si no hay fecha
        driverName: drivers[deviceId]?.name !== "Sin conductor" 
          ? drivers[deviceId]?.name || "" 
          : ""
      }));
      if (routeCreationDate && routeCreationDate.length > 0) {
        setrouteDate(routeCreationDate);
      }
      
    } catch (error) {
      
    } 
    console.log(deviceId);
  };
  const [data, setData] = useState({
    dateReport: getCurrentDate(),
    numberEnclosure: "",
    transportUnit: "",
    tranportist: "",
    driverName: "",
    origin: "",
    destination: "",
    dateColocation: getCurrentDate(),
    location: "",
    installationManager: "",
    dateTravel: getCurrentDate(),
    TravelObservation: "",
    dateArrival: getCurrentDate(),
    locationDestination: "",
    recepcionist: "",
    productCondition: "",
    openingDate: getCurrentDate(),
    locationOpening: "",
    openingManager: "",
    openingObservation: "",
  });

  
  const handleDragOver = (e) => {
    e.preventDefault();
    setOnInput(true);
    console.log(onInput);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setOnInput(false);
    console.log(onInput);
  };
  const handleDrop = (section, multiple) => (e) => {
    e.preventDefault();
    setOnInput(false);
    const files = e.dataTransfer.files;
    console.log(files);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => ({
        ...prev,
        [section]: multiple ? [...prev[section], ...newFiles] : [newFiles[0]],
      }));
      console.log("Archivos agregados:", newFiles);
    }
  };
  const handleFileInput = (section, multiple) => (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setFiles((prev) => ({
        ...prev,
        [section]: multiple ? [...prev[section], ...newFiles] : [newFiles[0]],
      }));
      console.log("Archivos agregados:", newFiles);
    }
  };
  const removeFile = (section, index) => {
    setFiles((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica de campos requeridos
    if (!data.dateReport || !data.numberEnclosure) {
      alert("Los campos fecha y número de precinto son obligatorios");
      return;
    }

    const formData = new FormData();

    // Crear objeto con los datos formateados correctamente
    const reportData = {
      ...data,
      // Asegurar formato de fechas
      dateReport: data.dateReport
        ? new Date(data.dateReport).toISOString()
        : null,
      dateColocation: data.dateColocation
        ? new Date(data.dateColocation).toISOString()
        : null,
      dateTravel: data.dateTravel
        ? new Date(data.dateTravel).toISOString()
        : null,
      dateArrival: data.dateArrival
        ? new Date(data.dateArrival).toISOString()
        : null,
      openingDate: data.openingDate
        ? new Date(data.openingDate).toISOString()
        : null,
    };

    // Agregar datos como JSON string
    formData.append("report", JSON.stringify(reportData));

    // Agregar archivos con prefijos
    Object.entries(files).forEach(([section, fileList]) => {
      fileList.forEach((file, index) => {
        formData.append(`files.${section}`, file);
      });
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_MY_BACKEND_API}/report`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      // Descargar PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // Manejo detallado de errores
      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Error del servidor:", errorJson);
          alert(`Error: ${errorJson.message || errorJson.error}`);
        } catch {
          console.error("Error desconocido:", errorText);
          alert("Error al procesar el reporte");
        }
      } else {
        console.error("Error de conexión:", error.message);
        alert("Error de conexión con el servidor");
      }
    }
  };
  return (
    <div className="containerReport">
      <form action="" onSubmit={handleSubmit}>
        <select
          name="Dispositivos"
          id="reportSelect"
          onChange={handleSelectDevice}
        >
          <option value="">Seleccione un dispositivo</option>
          {devices.map((device) => (
            <option key={device.id} value={device.name}>
              {device.name}
            </option>
          ))}
        </select>
        <h2>Informe de colocación, viaje, llegada a destino y apertura.</h2>
        <input
          type="date"
          name="dateReport"
          onChange={(e) => setData({ ...data, dateReport: e.target.value })}
          value={data.dateReport}
        />
        <input
          type="text"
          name="numberEnclosure"
          id=""
          placeholder="Numero de recinto"
          onChange={(e) =>
            setData({ ...data, numberEnclosure: e.target.value })
          }
          value={data.numberEnclosure}
        />
        <input
          type="text"
          name="transportUnit"
          id=""
          placeholder="Unidad de transporte"
          onChange={(e) => setData({ ...data, transportUnit: e.target.value })}
          value={data.transportUnit}
        />
        <input
          type="text"
          name="tranportist"
          id=""
          placeholder="Tranportista"
          onChange={(e) => setData({ ...data, tranportist: e.target.value })}
          value={data.tranportist}
        />
        <input
          type="text"
          name="driverName"
          id=""
          placeholder="Conductor"
          onChange={(e) => setData({ ...data, driverName: e.target.value })}
          value={data.driverName}
        />
        <input
          type="text"
          name="origin"
          id=""
          placeholder="Origen"
          onChange={(e) => setData({ ...data, origin: e.target.value })}
          value={data.origin}
        />
        <input
          type="text"
          name="destination"
          id=""
          placeholder="Destino"
          onChange={(e) => setData({ ...data, destination: e.target.value })}
          value={data.destination}
        />
        <h2>Colocación del Precinto Electrónico</h2>
        <input
          type="date"
          name="dateColocation"
          onChange={(e) => setData({ ...data, dateColocation: e.target.value })}
          value={data.dateColocation}
        />
        <input
          type="text"
          name="installationManager"
          id=""
          placeholder="Responsable de instalación"
          onChange={(e) =>
            setData({ ...data, installationManager: e.target.value })
          }
          value={data.installationManager}
        />
        <div className={onInput ? `containerImage over` : `containerImage`}>
          <Icons name="image-add" color="white" size="lg" />
          <label htmlFor="fileInput">
            {!onInput ? "Arrastre una imagen" : "Suelte la imagen dentro"}
          </label>
          <input
            type="file"
            accept="image/*"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop("colocacion", false)}
            onChange={handleFileInput("colocacion", false)}
            id="fileInput"
          />
        </div>
        <div className="preview-container">
          {files.colocacion.map((file, index) => (
            <div key={`colocacion-${index}`} className="file-preview">
              <img src={URL.createObjectURL(file)} alt="" />
              <button onClick={() => removeFile("colocacion", index)}>×</button>
            </div>
          ))}
        </div>
        <h2>Seguimiento de viaje</h2>
        <input
          type="date"
          name="dateTravel"
          onChange={(e) => setData({ ...data, dateTravel: e.target.value })}
          value={data.dateTravel}
        />
        <div className={onInput ? `containerImage over` : `containerImage`}>
          <Icons name="image-add" color="white" size="lg" />
          <label htmlFor="fileInput">
            {!onInput ? "Arrastre una imagen" : "Suelte la imagen dentro"}
          </label>
          <input
            type="file"
            accept="image/*"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop("viaje", true)}
            onChange={handleFileInput("viaje", true)}
            id="fileInput"
            multiple
          />
        </div>
        <div className="preview-container">
          {files.viaje.map((file, index) => (
            <div key={`viaje-${index}`} className="file-preview">
              <img src={URL.createObjectURL(file)} alt="" />
              <button onClick={() => removeFile("viaje", index)}>×</button>
            </div>
          ))}
        </div>
        <input
          type="text"
          name="TravelObservation"
          id=""
          placeholder="Observaciones"
          onChange={(e) =>
            setData({ ...data, TravelObservation: e.target.value })
          }
          value={data.TravelObservation}
        />
        <h2>Llegada a Destino</h2>
        <input
          type="date"
          name="dateArrival"
          onChange={(e) => setData({ ...data, dateArrival: e.target.value })}
          value={data.dateArrival}
        />
        <input
          type="text"
          name="recepcionist"
          id=""
          placeholder="Recepcionista"
          onChange={(e) => setData({ ...data, recepcionist: e.target.value })}
          value={data.recepcionist}
        />
        <input
          type="text"
          name="productCondition"
          id=""
          placeholder="Condiciones de la carga"
          onChange={(e) =>
            setData({ ...data, productCondition: e.target.value })
          }
          value={data.productCondition}
        />
        <div className={onInput ? `containerImage over` : `containerImage`}>
          <Icons name="image-add" color="white" size="lg" />
          <label htmlFor="fileInput">
            {!onInput ? "Arrastre una imagen" : "Suelte la imagen dentro"}
          </label>
          <input
            type="file"
            accept="image/*"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop("llegada", false)}
            onChange={handleFileInput("llegada", false)}
            id="fileInput"
          />
        </div>
        <div className="preview-container">
          {files.llegada.map((file, index) => (
            <div key={`llegada-${index}`} className="file-preview">
              <img src={URL.createObjectURL(file)} alt="" />
              <button onClick={() => removeFile("llegada", index)}>×</button>
            </div>
          ))}
        </div>
        <h2>Apertura del precinto electronico</h2>
        <input
          type="date"
          name="openingDate"
          onChange={(e) => setData({ ...data, openingDate: e.target.value })}
          value={data.openingDate}
        />
        <input
          type="text"
          name="openingManager"
          id=""
          placeholder="Responsable de apertura"
          onChange={(e) => setData({ ...data, openingManager: e.target.value })}
          value={data.openingManager}
        />
        <input
          type="text"
          name="openingObservation"
          id=""
          placeholder="Observaciones"
          onChange={(e) =>
            setData({ ...data, openingObservation: e.target.value })
          }
          value={data.openingObservation}
        />
        <div className={onInput ? `containerImage over` : `containerImage`}>
          <Icons name="image-add" color="white" size="lg" />
          <label htmlFor="fileInput">
            {!onInput ? "Arrastre una imagen" : "Suelte la imagen dentro"}
          </label>
          <input
            type="file"
            accept="image/*"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop("apertura", false)}
            onChange={handleFileInput("apertura", false)}
            id="fileInput"
          />
        </div>
        <div className="preview-container">
          {files.apertura.map((file, index) => (
            <div key={`apertura-${index}`} className="file-preview">
              <img src={URL.createObjectURL(file)} alt="" />
              <button onClick={() => removeFile("apertura", index)}>×</button>
            </div>
          ))}
        </div>
        <button type="submit">Generar reporte</button>
      </form>
    </div>
  );
}
