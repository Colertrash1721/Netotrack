import React from "react";
import { useState, useEffect } from "react";
import { LoginFail,LoginSucess } from "./alerts";

export function Changepass() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sucess, setSucessText] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_MY_BACKEND_API}/auth/changepass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailUser: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucessText(data.message); // Mensaje de éxito
      } else {
        setErrorMessage(data.message); // Error si el correo no está registrado
      }
    } catch (error) {
      console.log("Hubo un error: " + error);
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
    <div className="resetPassword">
      {errorMessage && <LoginFail descripcion={errorMessage} />}
            {sucess && (
              <>
                <LoginSucess descripcion={sucess} />
              </>
            )}
      <h1>Change Password</h1>
      <form onSubmit={handleForgotPassword}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">
          <span>Change password</span>
        </button>
      </form>
    </div>
  );
}
