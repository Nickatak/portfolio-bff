"use client";

import { useEffect, useState } from "react";
import { fetchAppointments } from "@/lib/api";

type Appointment = {
  id: number;
  appointmentId: string;
  eventType: string;
  occurredAt: string;
  startTime: string;
  endTime: string;
  email: string;
  phoneE164: string;
  notifyEmail: boolean;
  notifySms: boolean;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetchAppointments();
      setAppointments((response.data?.appointments as Appointment[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <main>Loading appointments…</main>;
  }

  return (
    <main>
      <h1>Appointments</h1>
      <p>Latest events consumed from Kafka.</p>
      <div className="table">
        {appointments.length === 0 ? (
          <div className="empty">No appointment events yet.</div>
        ) : (
          appointments.map((event) => (
            <div key={event.id} className="row">
              <div>
                <strong>{event.appointmentId}</strong>
                <div className="muted">{event.eventType}</div>
              </div>
              <div>
                <div>{new Date(event.startTime).toLocaleString()}</div>
                <div className="muted">→ {new Date(event.endTime).toLocaleString()}</div>
              </div>
              <div>
                <div>{event.email || "—"}</div>
                <div className="muted">{event.phoneE164 || "—"}</div>
              </div>
              <div>
                <span className={event.notifyEmail ? "pill on" : "pill"}>Email</span>
                <span className={event.notifySms ? "pill on" : "pill"}>SMS</span>
              </div>
            </div>
          ))
        )}
      </div>
      <style jsx>{`
        h1 {
          margin: 0 0 6px;
        }
        p {
          margin: 0 0 24px;
          color: var(--text-muted);
        }
        .table {
          display: grid;
          gap: 12px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          animation: rise-in 220ms ease-out;
        }
        .muted {
          color: var(--text-muted);
          font-size: 12px;
        }
        .pill {
          display: inline-block;
          padding: 4px 8px;
          margin-right: 6px;
          border-radius: 999px;
          background: var(--brand-soft);
          color: #f5dfcb;
          border: 1px solid var(--brand-soft-border);
          font-size: 13px;
          font-weight: 600;
        }
        .pill.on {
          background: linear-gradient(135deg, var(--brand), var(--brand-strong));
          color: var(--on-brand);
          border-color: transparent;
        }
        .empty {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          color: var(--text-muted);
        }
        @media (min-width: 900px) {
          .row {
            grid-template-columns: 1.2fr 1.5fr 1fr 0.8fr;
          }
        }
      `}</style>
    </main>
  );
}
