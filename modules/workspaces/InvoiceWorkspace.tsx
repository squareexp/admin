"use client";

import { InvoiceWorkspace as DashboardInvoiceWorkspace } from "@/components/dashboard";
import type {
  AdminInvoiceReviewResponse,
  AdminInvoiceSnapshot,
  ResendAdminInvoiceInput,
  AdminSystemSnapshot,
  CreateAdminInvoiceInput,
  ReviewAdminInvoiceInput,
  UpdateAdminInvoiceInput,
} from "@/lib/admin-types";

export function InvoiceWorkspace({
  data,
  system,
  isLoading,
  invoiceError,
  activeInvoiceId,
  onCreateInvoice,
  onGetInvoiceBin,
  onUpdateInvoice,
  onDeleteInvoice,
  onRestoreInvoice,
  onResendInvoice,
  onReviewInvoice,
}: {
  data: AdminInvoiceSnapshot | null;
  system: AdminSystemSnapshot | null;
  isLoading: boolean;
  invoiceError: string | null;
  activeInvoiceId: string | null;
  onCreateInvoice: (payload: CreateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>;
  onGetInvoiceBin: () => Promise<AdminInvoiceSnapshot>;
  onUpdateInvoice: (
    invoiceId: string,
    payload: UpdateAdminInvoiceInput,
  ) => Promise<AdminInvoiceSnapshot>;
  onDeleteInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>;
  onRestoreInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>;
  onResendInvoice: (
    invoiceId: string,
    payload?: ResendAdminInvoiceInput,
  ) => Promise<AdminInvoiceSnapshot>;
  onReviewInvoice: (
    invoiceId: string,
    payload: ReviewAdminInvoiceInput,
  ) => Promise<AdminInvoiceReviewResponse>;
}) {
  return (
    <DashboardInvoiceWorkspace
      data={data}
      system={system}
      isLoading={isLoading}
      invoiceError={invoiceError}
      activeInvoiceId={activeInvoiceId}
      onCreateInvoice={onCreateInvoice}
      onGetInvoiceBin={onGetInvoiceBin}
      onUpdateInvoice={onUpdateInvoice}
      onDeleteInvoice={onDeleteInvoice}
      onRestoreInvoice={onRestoreInvoice}
      onResendInvoice={onResendInvoice}
      onReviewInvoice={onReviewInvoice}
    />
  );
}
