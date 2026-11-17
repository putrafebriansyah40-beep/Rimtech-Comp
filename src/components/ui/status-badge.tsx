import React from "react";
import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS,
  SERVICE_STATUS,
  PAYMENT_STATUS,
  WHATSAPP_STATUS,
  type Tone,
} from "@/lib/constants";
import type {
  BookingStatus,
  ServiceStatus,
  PaymentStatus,
  WhatsappStatus,
} from "@prisma/client";

const toneBadgeClass: Record<Tone, string> = {
  slate: "badge-slate",
  amber: "badge-amber",
  sky: "badge-blue",
  emerald: "badge-emerald",
  rose: "badge-red",
  violet: "badge-purple",
  zinc: "badge-slate",
};

export function BookingBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const meta = BOOKING_STATUS[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <span className={cn("badge", toneBadgeClass[meta.tone], className)}>
      <span className="badge-dot" />
      <span>{meta.label}</span>
    </span>
  );
}

export function ServiceBadge({
  status,
  className,
}: {
  status: ServiceStatus;
  className?: string;
}) {
  const meta = SERVICE_STATUS[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <span className={cn("badge", toneBadgeClass[meta.tone], className)}>
      <span className="badge-dot animate-pulse" />
      <span>{meta.label}</span>
    </span>
  );
}

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const meta = PAYMENT_STATUS[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <span className={cn("badge", toneBadgeClass[meta.tone], className)}>
      <span className="badge-dot" />
      <span>{meta.label}</span>
    </span>
  );
}

export function WhatsappBadge({
  status,
  className,
}: {
  status: WhatsappStatus;
  className?: string;
}) {
  const meta = WHATSAPP_STATUS[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <span className={cn("badge", toneBadgeClass[meta.tone], className)}>
      <span className="badge-dot" />
      <span>{meta.label}</span>
    </span>
  );
}
