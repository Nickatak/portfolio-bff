"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, getCsrfToken, loginAdmin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await fetchSession();
      if (session.ok && session.data?.authenticated) {
        router.replace("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    getCsrfToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const response = await loginAdmin(username, password);
    setIsLoading(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Login failed.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="login">
      <div className="login-card">
        <h1>Portfolio Admin</h1>
        <p>Sign in to manage site content and appointments.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="test@ex.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
      <style jsx>{`
        .login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 16px 40px rgba(20, 22, 34, 0.12);
        }
        h1 {
          margin: 0 0 8px;
          font-size: 24px;
        }
        p {
          margin: 0 0 24px;
          color: #5a5f73;
        }
        form {
          display: grid;
          gap: 16px;
        }
        label {
          display: grid;
          gap: 8px;
          font-weight: 600;
          color: #2d3142;
        }
        input {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #d6d9e4;
        }
        .error {
          background: #ffe7e7;
          color: #b42318;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        button {
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          background: #1e2240;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.7;
          cursor: default;
        }
      `}</style>
    </main>
  );
}
