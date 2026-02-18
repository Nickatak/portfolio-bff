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
          color: #5a5f73;
        }
        .table {
          display: grid;
          gap: 12px;
        }
        .row {
          display: grid;
          grid-template-columns: 1.2fr 1.5fr 1fr 0.8fr;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(20, 22, 34, 0.08);
        }
        .muted {
          color: #7b8094;
          font-size: 12px;
        }
        .pill {
          display: inline-block;
          padding: 4px 8px;
          margin-right: 6px;
          border-radius: 999px;
          background: #e1e3ef;
          color: #5a5f73;
          font-size: 12px;
        }
        .pill.on {
          background: #1e2240;
          color: white;
        }
        .empty {
          background: white;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          color: #7b8094;
        }
        @media (max-width: 900px) {
          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
