import React from "react";
import { useState, useEffect } from "react";
import { LoginFail, LoginSucess } from "./alerts";
import { useNavigate } from "react-router-dom";

export function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setmessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sucess, setSucessText] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_MY_BACKEND_API}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newUser: {
            NameUser: username,
            emailUser: email,
            passwordUser: password,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucessText("Se pudo registrar correctamente");
        setTimeout(() => navigate('/'), 3000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.log("Hubo un error al iniciar sesión " + error);
    }
  };

  //alert
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

  //Check users
  useEffect(() => {
    if (username.trim() === "") return; // Evitar llamadas innecesarias
    const timer = setTimeout(async () => {
      const checkUser = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_MY_BACKEND_API}/auth/${username}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            setmessage("");
          } else {
            setmessage("Este usuario ya existe, intente otro");
          }
        } catch (error) {
          console.error("Usuario disponible");
        }
      };
      checkUser();
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);
  return (
    <div className="register">
      {errorMessage && <LoginFail descripcion={errorMessage} />}
      {sucess && (
        <>
          <LoginSucess descripcion={sucess} />
        </>
      )}
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="User"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p>{message}</p>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button type="submit">
          <span>Registrarse</span>
        </button>
      </form>
    </div>
  );
}
