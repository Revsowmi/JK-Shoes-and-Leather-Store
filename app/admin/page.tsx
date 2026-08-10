"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Simple prototype password. Move this to an env var later.
const ADMIN_PASSWORD = "jkshoes2026";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("jkAdminLoggedIn", "true");
      router.replace("/admin/dashboard");
    } else {
      setError("Wrong password. Try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#100c09",
          border: "1px solid #4e3a1c",
          borderRadius: "12px",
          padding: "40px",
          width: "320px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#dcae5d", marginBottom: "20px" }}>
          JK Shoes Admin
        </h1>

        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "13px",
            marginBottom: "15px",
            borderRadius: "7px",
            border: "1px solid #4e3a1c",
            background: "#080808",
            color: "#fff",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: "#ff5555", fontSize: "12px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "#dcae5d",
            color: "#111",
            border: "none",
            padding: "13px",
            borderRadius: "7px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          LOGIN
        </button>
      </div>
    </main>
  );
}