"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, getCsrfToken, loginAdmin } from "@/lib/api";
import { APP_NAME } from "@/lib/branding";

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
        <h1>{APP_NAME}</h1>
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
          padding: 16px;
        }
        .login-card {
          width: 100%;
          max-width: 460px;
          background: var(--surface);
          border-radius: 18px;
          padding: 20px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          backdrop-filter: blur(8px);
          animation: rise-in 220ms ease-out;
        }
        h1 {
          margin: 0 0 8px;
          font-size: 24px;
        }
        p {
          margin: 0 0 24px;
          color: var(--text-muted);
        }
        form {
          display: grid;
          gap: 16px;
        }
        label {
          display: grid;
          gap: 8px;
          font-weight: 600;
          color: var(--text);
        }
        input {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface-muted);
          color: var(--text);
          outline: none;
        }
        input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--focus-ring);
        }
        .error {
          background: var(--danger-soft);
          border: 1px solid var(--danger);
          color: #ffe3e7;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
        }
        button {
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, var(--brand), var(--brand-strong));
          color: var(--on-brand);
          font-weight: 600;
          cursor: pointer;
          transition: transform 120ms ease, filter 120ms ease;
        }
        button:hover:not(:disabled) {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.7;
          cursor: default;
        }
        @media (min-width: 700px) {
          .login {
            padding: 24px;
          }
          .login-card {
            padding: 32px;
          }
          h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
