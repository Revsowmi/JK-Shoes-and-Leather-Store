"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      sessionStorage.setItem("jkAdminLoggedIn", "true");
      window.location.href = "/admin/dashboard";
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#100c09",
          border: "1px solid #4e3a1c",
          borderRadius: "14px",
          padding: "35px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            color: "#dcae5d",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            marginBottom: "8px",
          }}
        >
          JK Shoes
        </h1>

        <p
          style={{
            color: "#999",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Admin Login
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              boxSizing: "border-box",
              marginBottom: "15px",
              background: "#080808",
              color: "#fff",
              border: "1px solid #4e3a1c",
              borderRadius: "7px",
              fontSize: "14px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              boxSizing: "border-box",
              marginBottom: "15px",
              background: "#080808",
              color: "#fff",
              border: "1px solid #4e3a1c",
              borderRadius: "7px",
              fontSize: "14px",
            }}
          />

          {error && (
            <p
              style={{
                color: "#ff5555",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#dcae5d",
              color: "#111",
              border: "none",
              borderRadius: "7px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            LOGIN
          </button>
        </form>
      </div>
    </main>
  );
}