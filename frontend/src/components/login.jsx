import React from "react";
import { useState, useEffect } from "react";
import { LoginFail, LoginSucess } from "./alerts";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sucess, setSucessText] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      console.log(process.env.REACT_APP_MY_BACKEND_API);
      const response = await fetch(`${process.env.REACT_APP_MY_BACKEND_API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log(data.user.email);

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("email", username);
        localStorage.setItem("password", password);
        setSucessText("Usuario logeado correctamente");
        setTimeout(() => navigate("/dashboardmain"), 3000);
        console.log(data);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión";
      setErrorMessage("Error al iniciar sesión, credenciales incorrectas");
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  useEffect(() => {
    if (sucess) {
      const timer = setTimeout(() => {
        setSucessText("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sucess]);

  return (
    <div className="login">
      {errorMessage && <LoginFail descripcion={errorMessage} />}
      {sucess && <LoginSucess descripcion={sucess} />}

      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="User"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          <span>INICIAR SESIÓN</span>
        </button>
      </form>
    </div>
  );
}
