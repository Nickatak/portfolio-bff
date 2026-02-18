"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchSession, logoutAdmin } from "@/lib/api";
import { APP_INITIALS, APP_NAME } from "@/lib/branding";

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/appointments", label: "Appointments" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const session = await fetchSession();
      if (!session.ok || !session.data?.authenticated) {
        router.replace("/login");
        return;
      }
      setUsername(session.data.user?.username ?? null);
      setChecking(false);
    };
    loadSession();
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/login");
  };

  if (checking) {
    return (
      <main>
        <div className="card">Checking session...</div>
        <style jsx>{`
          .card {
            max-width: 340px;
            margin: 28vh auto 0;
            padding: 16px;
            border-radius: 12px;
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text-muted);
          }
        `}</style>
      </main>
    );
  }

  return (
    <div className="layout">
      <aside>
        <div className="brand">
          <div className="logo">{APP_INITIALS}</div>
          <div>
            <strong>{APP_NAME}</strong>
            <span>{username ?? "Admin"}</span>
          </div>
        </div>
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="logout">
          Log out
        </button>
      </aside>
      <section>{children}</section>
      <style jsx>{`
        .layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
        }
        aside {
          background: rgba(10, 10, 10, 0.88);
          color: var(--text);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-right: 1px solid var(--border);
          backdrop-filter: blur(8px);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--brand), var(--brand-strong));
          color: var(--on-brand);
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .brand span {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        nav {
          display: grid;
          gap: 8px;
        }
        nav a {
          padding: 10px 12px;
          border-radius: 10px;
          background: transparent;
          color: var(--text);
          border: 1px solid rgba(201, 171, 143, 0.22);
          transition: background 140ms ease, border-color 140ms ease;
        }
        nav a.active,
        nav a:hover {
          background: var(--brand-soft);
          border-color: var(--brand-soft-border);
          color: var(--text);
        }
        .logout {
          margin-top: auto;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 140ms ease;
        }
        .logout:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        section {
          padding: 32px;
          animation: rise-in 220ms ease-out;
        }
        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
          aside {
            display: grid;
            gap: 14px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          nav {
            display: flex;
            gap: 8px;
            overflow: auto;
          }
          .logout {
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
}
