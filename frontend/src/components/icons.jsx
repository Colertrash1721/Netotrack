import React from 'react';
import "boxicons";

export default function Icons(props) {
  return (         
        <box-icon name={props.name} color={props.color} size={props.size} type={props.type} animation={`${props.clase}`} style={props.style} onClick={props.onClick}></box-icon>
    )
}
