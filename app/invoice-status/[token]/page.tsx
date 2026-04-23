"use client";

import { useEffect, useMemo, useState } from "react";

type PublicInvoiceStatus = {
  invoiceNumber: string;
  status: "draft" | "proforma" | "sent" | "paid" | "overdue";
  official: boolean;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  currency: string;
  totalAmount: number;
  issuerName: string;
  clientName: string;
  clientCompany: string | null;
  checkedAt: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function InvoiceStatusPage({
  params,
}: {
  params: { token: string };
}) {
  const [status, setStatus] = useState<PublicInvoiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = params.token;

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await fetch(`/api/public/invoices/${token}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : "Invoice status not found",
          );
        }

        if (!mounted) return;
        setStatus(payload as PublicInvoiceStatus);
      } catch (fetchError) {
        if (!mounted) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load invoice status",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const statusTone = useMemo(() => {
    switch (status?.status) {
      case "paid":
        return "text-[#bff55a]";
      case "sent":
        return "text-sky-300";
      case "overdue":
        return "text-rose-300";
      case "proforma":
        return "text-amber-300";
      default:
        return "text-white/72";
    }
  }, [status?.status]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_12%,rgba(205,255,4,0.08),transparent_40%),#04070f] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-[720px] rounded-[22px] border border-white/10 bg-[rgba(9,12,18,0.84)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">
          Square Invoice Status
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
          Verify invoice payment and authenticity
        </h1>
        <hr className="divider-dashed mt-4" />

        {isLoading ? (
          <p className="mt-4 text-sm text-white/66">Checking invoice status...</p>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-4 rounded-[14px] border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {!isLoading && status ? (
          <div className="mt-4 grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Invoice
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {status.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Current status
                </p>
                <p className={`mt-1 text-sm font-semibold uppercase tracking-[0.16em] ${statusTone}`}>
                  {status.status}
                </p>
              </div>
            </div>

            <hr className="divider-dashed" />

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Issuer</p>
                <p className="mt-1 text-sm text-white">{status.issuerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Client</p>
                <p className="mt-1 text-sm text-white">
                  {status.clientCompany || status.clientName}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Issued</p>
                <p className="mt-1 text-sm text-white">{formatDate(status.issuedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Due</p>
                <p className="mt-1 text-sm text-white">{formatDate(status.dueAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Paid</p>
                <p className="mt-1 text-sm text-white">{formatDate(status.paidAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Total</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatMoney(status.totalAmount, status.currency)}
                </p>
              </div>
            </div>

            <hr className="divider-dashed" />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-white/70">
                Verification result:
                {" "}
                <span className={status.official ? "text-[#bff55a]" : "text-amber-300"}>
                  {status.official ? "Official invoice" : "Draft or proforma"}
                </span>
              </p>
              <p className="text-[11px] text-white/48">
                Checked {formatDate(status.checkedAt)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
