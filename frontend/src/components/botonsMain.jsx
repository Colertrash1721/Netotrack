import React from "react";
import Botones from "./botones";

export const BotonsMain = ({ 
  onSetRoute, 
  onSaveRoute, 
  routes, 
  selectedRoute, 
  onRouteChange,
  saveCRDatabase
}) => {
  return (
    <div className="botonsMain">
      <Botones
        Name="botonsMain"
        name="Establecer ruta"
        onClick={onSetRoute}
      />
      <Botones
        Name="botonsMain"
        name="Guardar ruta"
        onClick={saveCRDatabase}
      />
      <Botones
        Name="botonsMain"
        name="Establecer RC"
        onClick={onSaveRoute}
      />
      <select
        name="concurrentsroutes"
        id="concurrent"
        value={selectedRoute}
        onChange={onRouteChange}
      >
        <option value="Saved routes">Concurrente</option>
        {routes.map((routeName, index) => (
          <option key={index} value={routeName}>
            {routeName}
          </option>
        ))}
      </select>
    </div>
  );
};