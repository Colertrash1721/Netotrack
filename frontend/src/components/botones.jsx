import React from "react";
import "../style/main.css";

export default function Botones(props) {
  return <button onClick={props.onClick} id={props.id}>{props.name}</button>;
}
