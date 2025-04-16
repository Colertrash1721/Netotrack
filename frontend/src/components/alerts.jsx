import React from 'react'
import '../style/login.css';
import Icons from './icons';

export function LoginFail(props) {
  return (
    <div className="alertas fail">
        <div className='icon'>
            <Icons clase="flashing" name="error" color="white" size="lg" type="solid"/>
        </div>
        <div className="alert">
          <h1>Opss!!!</h1>
          <p>{props.descripcion}</p>
          </div>
    </div>
  )
}
export function LoginSucess(props) {
  return (
    <div className="alertas sucess">
        <div className='icon'>
            <Icons clase="tada" name="check-circle" color="white" size="lg"/>
        </div>
        <div className="alert">
          <h1>Good!!!</h1>
          <p>{props.descripcion}</p>
          </div>
    </div>
  )
}
