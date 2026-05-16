import { useEffect, useState } from "react";
import "./App.css";

type Status = "loading" | "success" | "error";

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "";

    fetch(`${apiUrl}/api/hello`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ message: string }>;
      })
      .then((data) => {
        setMessage(data.message);
        setStatus("success");
      })
      .catch(() => {
        setMessage("Could not reach the backend.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="container">
      <div className="card">
        <div className={`dot dot--${status}`} />

        {status === "loading" && (
          <p className="label">Connecting to backend…</p>
        )}

        {status === "success" && (
          <>
            <h1 className="message">{message}</h1>
            <p className="label">API responded successfully ✓</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="message error">{message}</h1>
            <p className="label">Make sure the backend is running.</p>
          </>
        )}
      </div>
    </main>
  );
}
