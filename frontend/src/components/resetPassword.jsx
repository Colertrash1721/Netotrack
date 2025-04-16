import React from "react";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { LoginFail,LoginSucess } from "./alerts";
import { useNavigate } from "react-router-dom";

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [sucess, setSucessText] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setSucessText('')
    setErrorMessage('')

    try {
      const response = await fetch(`${process.env.REACT_APP_MY_BACKEND_API}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucessText('Password updated successfully!');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
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
      <form onSubmit={handleNewPassword}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">
          <span>New password</span>
        </button>
      </form>
    </div>
  );
}
