import React from "react";
import { Check } from "lucide-react";
import { formatDateTimeWIB } from "@/lib/dates";
import { SERVICE_STATUS } from "@/lib/constants";
import type { ServiceStatus } from "@prisma/client";

type LogItem = {
  id: number;
  status: ServiceStatus;
  notes: string | null;
  createdAt: Date;
  technician?: { name: string } | null;
};

const stepHierarchy: ServiceStatus[] = [
  "MENUNGGU_PENYERAHAN",
  "SEDANG_DIDIAGNOSA",
  "SEDANG_DIPERBAIKI",
  "SELESAI",
  "DIAMBIL",
];

export function ServiceTimeline({
  currentStatus,
  logs,
}: {
  currentStatus: ServiceStatus;
  logs: LogItem[];
}) {
  const currentStepIndex = stepHierarchy.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", position: "relative" }}>
        {stepHierarchy.map((step, idx) => {
          const isPassed = idx < currentStepIndex || currentStatus === "DIAMBIL";
          const isCurrent = idx === currentStepIndex && currentStatus !== "DIAMBIL";
          const meta = SERVICE_STATUS[step];

          let iconBg = "var(--surface-alt)";
          let iconColor = "var(--text-subtle)";
          let iconBorder = "var(--border)";
          if (isPassed) {
            iconBg = "var(--success)";
            iconColor = "#ffffff";
            iconBorder = "var(--success)";
          } else if (isCurrent) {
            iconBg = "var(--primary)";
            iconColor = "#ffffff";
            iconBorder = "var(--primary)";
          }

          return (
            <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  backgroundColor: iconBg,
                  color: iconColor,
                  border: `1.5px solid ${iconBorder}`,
                  boxShadow: isCurrent ? "0 0 0 4px rgba(2, 132, 199, 0.2)" : "var(--shadow-xs)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {isPassed ? <Check style={{ width: "1rem", height: "1rem" }} /> : idx + 1}
              </div>
              <span
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent ? "var(--primary)" : isPassed ? "var(--text-primary)" : "var(--text-subtle)",
                  lineHeight: 1.2,
                }}
              >
                {meta?.label || step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit History Logs */}
      <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
          Riwayat Perkembangan Pengerjaan
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {logs.map((log) => {
            const meta = SERVICE_STATUS[log.status];
            return (
              <div
                key={log.id}
                style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.875rem 1rem",
                  border: "1px solid var(--border)",
                  borderLeft: "4px solid var(--primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                    {meta?.label || log.status}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {formatDateTimeWIB(log.createdAt)}
                  </span>
                </div>
                {log.notes && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                    {log.notes}
                  </p>
                )}
                {log.technician && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", display: "block", marginTop: "0.375rem" }}>
                    Diperbarui oleh: {log.technician.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
