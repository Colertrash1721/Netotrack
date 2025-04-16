import {React, useState} from "react";
import "../style/login.css";
import { Login } from "./login";
import { Wall } from "./wall";
import { Changepass } from "./changepass";
import "boxicons";

export const LoginSession = () => {
  const [user, setUser] = useState(true);
  const [rememberpass, setremember] = useState(false);
  function handleUser() {
    setUser(!user);
  }
  function handlePassword() {
    setremember(!rememberpass);
  }
  return (
    <div className="appLogin">
      <div className="loginContainer">
        <Wall />
        {rememberpass ? <Changepass /> : <Login />}
  
        <div className="loginLinks">
          <a href="#" onClick={handleUser}>
            {rememberpass
              ? "Try to remember"
              : "Insert your password"
            }
          </a>
  
          <a href="#" onClick={handlePassword}>
            {rememberpass ? "Return to login" : "Reset password"}
          </a>
      </div>
      </div>
      <script
        src="https://kit.fontawesome.com/7fbfd9b43f.js"
        crossorigin="anonymous"
      ></script>
    </div>
  );
};
