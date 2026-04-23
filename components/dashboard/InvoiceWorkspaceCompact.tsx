"use client"

import React, { useEffect, useRef, useState } from "react"
import { Add, TickCircle, Trash, Profile2User, DocumentText1, Airdrop, Maximize } from "iconsax-react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type {
  AdminInvoice,
  AdminInvoiceAiReview,
  AdminInvoiceReviewResponse,
  AdminInvoiceSnapshot,
  ResendAdminInvoiceInput,
  AdminSystemSnapshot,
  CreateAdminInvoiceInput,
  ReviewAdminInvoiceInput,
  UpdateAdminInvoiceInput,
} from "@/lib/admin-types"
import { cn } from "@/lib/utils"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu"
import {
  glassButtonNeutralClass,
  glassIconButtonClass,
  glassInputClass,
  glassMenuContentClass,
  glassMenuDangerItemClass,
  glassMenuLabelClass,
  glassMenuSeparatorClass,
  glassPillAccentButtonClass,
  glassPillButtonClass,
  glassSegmentedControlClass,
  glassSegmentedItemActiveClass,
  glassSegmentedItemClass,
} from "../ui/glass"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Textarea } from "../ui/textarea"
import Image from "next/image"
import { compactAccentButtonClassName, compactPillButtonClassName, compactMiniAccentButtonClassName, compactMiniButtonClassName, compactTextareaClassName, compactInputClassName } from "../ui/global.css"

const invoiceStatuses = ["draft", "sent", "paid", "overdue", "proforma"] as const
const invoiceDisplayVariants = ["light", "dark"] as const
const currencyOptions = ["USD", "TZS", "KES", "EUR"] as const

type InvoiceStatus = (typeof invoiceStatuses)[number]
type InvoiceDisplayVariant = (typeof invoiceDisplayVariants)[number]
type InvoiceLibraryMode = "active" | "bin"
type InvoiceViewportMode = "list" | "editor"
type InvoiceEditorMode = "edit" | "new"
type ExportFormat = "pdf" | "png" | "jpeg"
type PreviewScale = "fit" | "large"

type InvoiceLineItem = {
  id: string
  title: string
  description: string
  quantity: number
  rate: number
}

type InvoicePreviewPage = {
  id: string
  pageNumber: number
  label: string
  lineItems: InvoiceLineItem[]
  showFullHeader: boolean
  showSummary: boolean
}

type InvoiceDraft = {
  id: string
  number: string
  status: InvoiceStatus
  publicStatusToken: string
  issuerName: string
  issuerEmail: string
  logoUrl: string
  displayVariant: InvoiceDisplayVariant
  logoSize: number
  fontSize: number
  tableItemCornerRadius: number
  clientName: string
  clientCompany: string
  clientEmail: string
  partnerEnabled: boolean
  partnerLabel: string
  partnerName: string
  partnerCompany: string
  partnerEmail: string
  partnerLogoUrl: string
  issueDate: string
  dueDate: string
  currency: string
  taxRate: number
  paymentTerms: string
  notes: string
  memo: string
  aiReview: AdminInvoiceAiReview | null
  deletedAt: string | null
  restoreUntil: string | null
  lastResentAt: string | null
  lastResentByName: string | null
  lineItems: InvoiceLineItem[]
}

type ResendComposerState = {
  isOpen: boolean
  invoiceId: string
  invoiceNumber: string
  subject: string
  contextNote: string
}

const statusMeta: Record<
  InvoiceStatus,
  {
    label: string
    tone: string
    border: string
    bg: string
  }
> = {
  draft: {
    label: "Draft",
    tone: "text-white/72",
    border: "border-white/10",
    bg: "bg-white/[0.03]",
  },
  sent: {
    label: "Sent",
    tone: "text-sky-200",
    border: "border-sky-400/20",
    bg: "bg-sky-400/10",
  },
  paid: {
    label: "Paid",
    tone: "text-[var(--sq-brand-action)]",
    border: "border-[rgba(205,255,4,0.22)]",
    bg: "bg-[rgba(205,255,4,0.1)]",
  },
  overdue: {
    label: "Overdue",
    tone: "text-rose-200",
    border: "border-rose-400/20",
    bg: "bg-rose-400/10",
  },
  proforma: {
    label: "Proforma",
    tone: "text-amber-200",
    border: "border-amber-400/20",
    bg: "bg-amber-400/10",
  },
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function sanitizeFilename(value: string) {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "invoice"
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = filename
  anchor.click()
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "No date"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "No date"
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toDateInputValue(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function toDateInputFromIso(value?: string | null) {
  if (!value) {
    return toDateInputValue(new Date())
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return toDateInputValue(new Date())
  }

  return toDateInputValue(date)
}

function toIsoFromDateInput(value: string) {
  if (!value) {
    return undefined
  }

  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000)
}

function parseNumberInput(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function cloneLineItem(item: InvoiceLineItem): InvoiceLineItem {
  return { ...item }
}

function cloneInvoice(invoice: InvoiceDraft): InvoiceDraft {
  return {
    ...invoice,
    lineItems: invoice.lineItems.map(cloneLineItem),
  }
}

function buildLineItem(seed?: Partial<InvoiceLineItem>): InvoiceLineItem {
  return {
    id: seed?.id || createId("line"),
    title: seed?.title || "Service",
    description: seed?.description || "",
    quantity: seed?.quantity ?? 1,
    rate: seed?.rate ?? 0,
  }
}

function buildInvoice(seed: Partial<InvoiceDraft> & { number: string; status: InvoiceStatus }): InvoiceDraft {
  const issueDate = seed.issueDate ? new Date(seed.issueDate) : new Date()
  const dueDate = seed.dueDate ? new Date(seed.dueDate) : addDays(issueDate, 14)

  return {
    id: seed.id || createId("invoice"),
    number: seed.number,
    status: seed.status,
    publicStatusToken: seed.publicStatusToken || createId("public"),
    issuerName: seed.issuerName || "Square Experience",
    issuerEmail: seed.issuerEmail || "billing@squareexp.com",
    logoUrl: seed.logoUrl || "/logo.svg",
    displayVariant: seed.displayVariant || "light",
    logoSize: seed.logoSize ?? 36,
    fontSize: seed.fontSize ?? 12,
    tableItemCornerRadius: seed.tableItemCornerRadius ?? 8,
    clientName: seed.clientName || "New client",
    clientCompany: seed.clientCompany || "Client company",
    clientEmail: seed.clientEmail || "finance@client.com",
    partnerEnabled: seed.partnerEnabled || false,
    partnerLabel: seed.partnerLabel || "Partner company",
    partnerName: seed.partnerName || "",
    partnerCompany: seed.partnerCompany || "",
    partnerEmail: seed.partnerEmail || "",
    partnerLogoUrl: seed.partnerLogoUrl || "",
    issueDate: toDateInputValue(issueDate),
    dueDate: toDateInputValue(dueDate),
    currency: seed.currency || "USD",
    taxRate: seed.taxRate ?? 18,
    paymentTerms: seed.paymentTerms || "Net 14",
    notes: seed.notes || "Thank you for choosing Square Experience.",
    memo: seed.memo || "Internal note",
    aiReview: seed.aiReview || null,
    deletedAt: seed.deletedAt || null,
    restoreUntil: seed.restoreUntil || null,
    lastResentAt: seed.lastResentAt || null,
    lastResentByName: seed.lastResentByName || null,
    lineItems: (seed.lineItems || [
      buildLineItem({
        title: "Discovery and planning",
        description: "Project scoping and implementation planning.",
        quantity: 1,
        rate: 1200,
      }),
      buildLineItem({
        title: "Delivery sprint",
        description: "Core build and operational handoff.",
        quantity: 1,
        rate: 1800,
      }),
    ]).map(cloneLineItem),
  }
}

function getInvoiceLineAmount(item: InvoiceLineItem) {
  return item.quantity * item.rate
}

function getInvoiceTotals(invoice: InvoiceDraft) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + getInvoiceLineAmount(item), 0)
  const tax = subtotal * (invoice.taxRate / 100)
  const total = subtotal + tax

  return {
    subtotal,
    tax,
    total,
  }
}

function getInvoiceEmailSubject(invoice: InvoiceDraft) {
  return `Invoice ${invoice.number} · ${invoice.issuerName}`
}

function getInvoiceEmailContext(invoice: InvoiceDraft) {
  return `Hello ${invoice.clientName},\n\nSharing an update for invoice ${invoice.number}. Please review and confirm receipt.\n\nThank you,\n${invoice.issuerName}`
}

function estimateLineItemUnits(item: InvoiceLineItem) {
  const titleUnits = Math.max(1, Math.ceil(item.title.trim().length / 34)) * 0.45
  const descriptionUnits = item.description
    ? Math.min(4, Math.ceil(item.description.trim().length / 86)) * 0.72
    : 0

  return 1.05 + titleUnits + descriptionUnits
}

function buildInvoicePreviewPages(invoice: InvoiceDraft): InvoicePreviewPage[] {
  const firstPageCapacity = invoice.partnerEnabled && invoice.partnerCompany ? 7.8 : 8.9
  const continuationCapacity = 13.8
  const rawPages: Array<{ lineItems: InvoiceLineItem[]; used: number }> = [{ lineItems: [], used: 0 }]
  let pageIndex = 0

  invoice.lineItems.forEach((item) => {
    const units = estimateLineItemUnits(item)
    const capacity = pageIndex === 0 ? firstPageCapacity : continuationCapacity
    const activePage = rawPages[pageIndex]

    if (activePage.lineItems.length > 0 && activePage.used + units > capacity) {
      rawPages.push({ lineItems: [item], used: units })
      pageIndex += 1
      return
    }

    activePage.lineItems.push(item)
    activePage.used += units
  })

  return rawPages.map((page, index) => {
    const isFirst = index === 0
    const isLast = index === rawPages.length - 1
    const isSummaryOnly = isLast && page.lineItems.length === 0

    return {
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      label: isSummaryOnly ? "Summary" : isFirst ? "Overview" : isLast ? "Wrap-up" : "Charges",
      lineItems: page.lineItems,
      showFullHeader: isFirst,
      showSummary: isLast,
    }
  })
}

function getNextInvoiceNumber(invoices: Pick<InvoiceDraft, "number">[]) {
  const nextSeed = invoices.reduce((max, invoice) => {
    const match = invoice.number.match(/(\d+)(?!.*\d)/)
    if (!match) {
      return max
    }

    const numeric = Number(match[1])
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max
  }, 1230)

  return `SQ-${(nextSeed + 1).toString().padStart(5, "0")}`
}

function getNewBlankInvoice(invoices: InvoiceDraft[]) {
  const issueDate = new Date()
  const dueDate = addDays(issueDate, 14)

  return buildInvoice({
    id: createId("invoice-new"),
    number: getNextInvoiceNumber(invoices),
    status: "draft",
    issueDate: toDateInputValue(issueDate),
    dueDate: toDateInputValue(dueDate),
    lineItems: [
      buildLineItem({
        title: "Service line",
        description: "Describe the work being invoiced.",
        quantity: 1,
        rate: 0,
      }),
    ],
  })
}

function mapAdminInvoiceToDraft(invoice: AdminInvoice): InvoiceDraft {
  return {
    id: invoice.id,
    number: invoice.invoiceNumber,
    status: invoice.status,
    publicStatusToken: invoice.publicStatusToken,
    issuerName: invoice.issuerName || "Square Experience",
    issuerEmail: invoice.issuerEmail || "billing@squareexp.com",
    logoUrl: invoice.logoUrl || "/logo.svg",
    displayVariant: invoice.displayVariant || "light",
    logoSize: invoice.logoSize || 36,
    fontSize: invoice.fontSize || 12,
    tableItemCornerRadius: invoice.tableItemCornerRadius ?? 8,
    clientName: invoice.clientName,
    clientCompany: invoice.clientCompany || "Client company",
    clientEmail: invoice.clientEmail,
    partnerEnabled: invoice.partnerEnabled || false,
    partnerLabel: invoice.partnerLabel || "Partner company",
    partnerName: invoice.partnerName || "",
    partnerCompany: invoice.partnerCompany || "",
    partnerEmail: invoice.partnerEmail || "",
    partnerLogoUrl: invoice.partnerLogoUrl || "",
    issueDate: toDateInputFromIso(invoice.issueDate),
    dueDate: toDateInputFromIso(invoice.dueDate),
    currency: invoice.currency || "USD",
    taxRate: invoice.taxRate,
    paymentTerms: invoice.terms || "Net 14",
    notes: invoice.notes || "",
    memo: invoice.internalMemo || "",
    aiReview: invoice.aiReview || null,
    deletedAt: invoice.deletedAt || null,
    restoreUntil: invoice.restoreUntil || null,
    lastResentAt: invoice.lastResentAt || null,
    lastResentByName: invoice.lastResentByName || null,
    lineItems:
      invoice.items.length > 0
        ? invoice.items
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((item) =>
              buildLineItem({
                id: item.id,
                title: item.title,
                description: item.description || "",
                quantity: item.quantity,
                rate: item.unitPrice,
              }),
            )
        : [buildLineItem()],
  }
}

function mapDraftToInvoicePayload(draft: InvoiceDraft): CreateAdminInvoiceInput {
  return {
    invoiceNumber: draft.number,
    status: draft.status,
    issuerName: draft.issuerName,
    issuerEmail: draft.issuerEmail,
    clientName: draft.clientName,
    clientEmail: draft.clientEmail,
    clientCompany: draft.clientCompany,
    partnerEnabled: draft.partnerEnabled,
    partnerLabel: draft.partnerLabel,
    partnerName: draft.partnerName || undefined,
    partnerCompany: draft.partnerCompany || undefined,
    partnerEmail: draft.partnerEmail || undefined,
    partnerLogoUrl: draft.partnerLogoUrl || undefined,
    issueDate: toIsoFromDateInput(draft.issueDate),
    dueDate: toIsoFromDateInput(draft.dueDate),
    currency: draft.currency,
    notes: draft.notes,
    internalMemo: draft.memo,
    terms: draft.paymentTerms,
    logoUrl: draft.logoUrl || "/logo.svg",
    displayVariant: draft.displayVariant,
    logoSize: draft.logoSize,
    fontSize: draft.fontSize,
    tableItemCornerRadius: draft.tableItemCornerRadius,
    taxRate: draft.taxRate,
    items: draft.lineItems.map((item, index) => ({
      id: item.id,
      title: item.title,
      description: item.description || undefined,
      quantity: item.quantity,
      unitPrice: item.rate,
      sortOrder: index,
    })),
  }
}

function InvoiceStatusBadge({ status, inverse = false }: { status: InvoiceStatus; inverse?: boolean }) {
  const meta = statusMeta[status]

  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]",
        inverse ? "border-slate-300 bg-white text-slate-700" : cn(meta.border, meta.bg, meta.tone),
      )}
    >
      {meta.label}
    </span>
  )
}

function SortableLineItemCard({
  item,
  onUpdateLineItem,
  onRemoveLineItem,
  compactInputClassName,
}: {
  item: InvoiceLineItem
  onUpdateLineItem: (itemId: string, patch: Partial<InvoiceLineItem>) => void
  onRemoveLineItem: (itemId: string) => void
  compactInputClassName: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid gap-2 rounded-[16px] border border-dashed border-white/10 p-2",
        isDragging ? "border-[rgba(205,255,4,0.26)] bg-[rgba(205,255,4,0.07)] shadow-[0_18px_32px_rgba(0,0,0,0.26)]" : "",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.24em] text-white/42">Line item</p>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={cn(glassPillButtonClass, "h-6 px-2 text-[11px] tracking-[0.24em]")}
          aria-label="Reorder line item"
        >
          ≡
        </button>
      </div>
      <CompactField label="Title">
        <Input value={item.title} onChange={(event) => onUpdateLineItem(item.id, { title: event.target.value })} className={compactInputClassName} />
      </CompactField>
      <CompactField label="Description">
        <Input value={item.description} onChange={(event) => onUpdateLineItem(item.id, { description: event.target.value })} className={compactInputClassName} />
      </CompactField>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <CompactField label="Qty">
          <Input
            type="number"
            min="0"
            step="0.1"
            value={item.quantity}
            onChange={(event) => onUpdateLineItem(item.id, { quantity: parseNumberInput(event.target.value, 0) })}
            className={compactInputClassName}
          />
        </CompactField>
        <CompactField label="Rate">
          <Input
            type="number"
            min="0"
            step="1"
            value={item.rate}
            onChange={(event) => onUpdateLineItem(item.id, { rate: parseNumberInput(event.target.value, 0) })}
            className={compactInputClassName}
          />
        </CompactField>
        <button
          type="button"
          onClick={() => onRemoveLineItem(item.id)}
          className={cn(
            glassIconButtonClass,
            "mt-5 h-7 w-7 rounded-[12px] text-white/55 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200",
          )}
        >
          <Trash variant="Bulk" size={14} color="currentColor" />
        </button>
      </div>
    </div>
  )
}

function InvoicePreviewThumbnail({
  page,
  totalPages,
  isActive,
  previewIsDark,
  onSelect,
}: {
  page: InvoicePreviewPage
  totalPages: number
  isActive: boolean
  previewIsDark: boolean
  onSelect: () => void
}) {
  const previewBars = Array.from({ length: Math.min(Math.max(page.lineItems.length, 2), 5) })

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-[14px] border px-1.5 py-1.5 text-left transition-all",
        isActive
          ? "border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.08)] shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
          : "border-white/10 bg-black/10 hover:border-white/16 hover:bg-white/[0.03]",
      )}
    >
      <div
        className={cn(
          "aspect-[210/297] rounded-[10px] border p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
          previewIsDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950",
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn("flex items-center justify-between border-b border-dashed pb-1 text-[5px] uppercase tracking-[0.22em]", previewIsDark ? "border-white/10 text-white/45" : "border-slate-200 text-slate-400")}>
            <span>Page {page.pageNumber}</span>
            <span>{page.label}</span>
          </div>
          <div className="mt-1.5 grid gap-1">
            <div className={cn("h-1 w-10 rounded-full", previewIsDark ? "bg-white/14" : "bg-slate-200")} />
            <div className={cn("h-1 w-14 rounded-full", previewIsDark ? "bg-white/10" : "bg-slate-100")} />
          </div>
          <div className={cn("mt-2 rounded-[6px] border border-dashed p-1", previewIsDark ? "border-white/10" : "border-slate-200")}>
            <div className="space-y-1">
              {previewBars.map((_, index) => (
                <div key={`${page.id}-bar-${index}`} className="grid grid-cols-[1.6fr_0.5fr_0.7fr] gap-1">
                  <div className={cn("h-1 rounded-full", previewIsDark ? "bg-white/12" : "bg-slate-200")} />
                  <div className={cn("h-1 rounded-full", previewIsDark ? "bg-white/10" : "bg-slate-100")} />
                  <div className={cn("h-1 rounded-full", previewIsDark ? "bg-white/16" : "bg-slate-300")} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto pt-1.5">
            <div className={cn("flex items-center justify-between border-t border-dashed pt-1 text-[5px] uppercase tracking-[0.18em]", previewIsDark ? "border-white/10 text-white/45" : "border-slate-200 text-slate-400")}>
              <span>{page.lineItems.length} lines</span>
              <span>
                {page.pageNumber}/{totalPages}
              </span>
            </div>
            {page.showSummary ? (
              <div className={cn("mt-1 h-3 rounded-[5px]", previewIsDark ? "bg-white/12" : "bg-slate-200")} />
            ) : null}
          </div>
        </div>
      </div>
    </button>
  )
}

function InvoicePreviewPaper({
  draft,
  page,
  totalPages,
  currentTotals,
  previewIsDark,
  publicStatusUrl,
  publicStatusQrCode,
  className,
}: {
  draft: InvoiceDraft
  page: InvoicePreviewPage
  totalPages: number
  currentTotals: ReturnType<typeof getInvoiceTotals>
  previewIsDark: boolean
  publicStatusUrl: string
  publicStatusQrCode: string | null
  className?: string
}) {
  const itemCornerRadius = clampNumber(draft.tableItemCornerRadius || 0, 0, 24)
  const logoHeight = clampNumber(draft.logoSize || 36, 12, 72)
  const lineItemFontSize = clampNumber(draft.fontSize || 12, 10, 16)
  const isOfficialInvoice = !["draft", "proforma"].includes(draft.status)

  return (
    <div
      style={{ fontSize: `${lineItemFontSize}px` }}
      className={cn(
        "aspect-[210/297] min-h-[960px] w-full rounded-[16px] border p-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)]",
        previewIsDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {page.showFullHeader ? (
          <>
            <div className={cn("flex items-start justify-between gap-6 border-b border-dashed pb-6", previewIsDark ? "border-white/10" : "border-slate-200")}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={draft.logoUrl || "/logo.svg"}
                    alt={draft.issuerName}
                    crossOrigin="anonymous"
                    style={{ height: `${logoHeight}px` }}
                    className={cn("w-auto max-w-[220px] object-contain", previewIsDark ? "brightness-0 invert" : "brightness-0")}
                  />
                  {draft.partnerEnabled && draft.partnerLogoUrl ? (
                    <img
                      src={draft.partnerLogoUrl}
                      alt={draft.partnerCompany || draft.partnerLabel}
                      crossOrigin="anonymous"
                      style={{ height: `${Math.max(20, Math.round(logoHeight * 0.78))}px` }}
                      className={cn("w-auto max-w-[180px] object-contain", previewIsDark ? "brightness-0 invert" : "brightness-0")}
                    />
                  ) : null}
                </div>
                <p className={cn("mt-6 text-[11px] uppercase tracking-[0.28em]", previewIsDark ? "text-white/42" : "text-slate-400")}>Invoice</p>
                <h3 className={cn("mt-2 text-[38px] font-semibold tracking-[-0.06em]", previewIsDark ? "text-white" : "text-slate-950")}>
                  {draft.number}
                </h3>
              </div>

              <div className="text-right">
                <p className={cn("text-sm font-medium", previewIsDark ? "text-white/85" : "text-slate-700")}>Issued {formatDateLabel(draft.issueDate)}</p>
                <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/55" : "text-slate-500")}>Due {formatDateLabel(draft.dueDate)}</p>
                <p className={cn("mt-3 text-[11px]", previewIsDark ? "text-white/42" : "text-slate-500")}>
                  Page {page.pageNumber} of {totalPages}
                </p>
                {draft.lastResentAt ? (
                  <p className={cn("mt-1 text-[11px]", previewIsDark ? "text-white/44" : "text-slate-500")}>
                    Last resend {formatDateLabel(draft.lastResentAt)}
                    {draft.lastResentByName ? ` by ${draft.lastResentByName}` : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <p className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/42" : "text-slate-400")}>From</p>
                <p className={cn("mt-2 text-lg font-semibold", previewIsDark ? "text-white" : "text-slate-950")}>{draft.issuerName}</p>
                <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/60" : "text-slate-600")}>{draft.issuerEmail}</p>
              </div>
              <div>
                <p className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/42" : "text-slate-400")}>Bill to</p>
                <p className={cn("mt-2 text-lg font-semibold", previewIsDark ? "text-white" : "text-slate-950")}>{draft.clientCompany}</p>
                <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/60" : "text-slate-600")}>{draft.clientName}</p>
                <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/48" : "text-slate-500")}>{draft.clientEmail}</p>
              </div>
              {draft.partnerEnabled && draft.partnerCompany ? (
                <div className={cn("md:col-span-2 border border-dashed px-4 py-4", previewIsDark ? "border-white/10" : "border-slate-200")}>
                  <p className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/42" : "text-slate-400")}>
                    {draft.partnerLabel || "Partner company"}
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div>
                      <p className={cn("text-sm font-semibold", previewIsDark ? "text-white" : "text-slate-950")}>{draft.partnerCompany}</p>
                      {draft.partnerName ? (
                        <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/60" : "text-slate-600")}>{draft.partnerName}</p>
                      ) : null}
                      {draft.partnerEmail ? (
                        <p className={cn("mt-1 text-sm", previewIsDark ? "text-white/48" : "text-slate-500")}>{draft.partnerEmail}</p>
                      ) : null}
                    </div>
                    {draft.partnerLogoUrl ? (
                      <img
                        src={draft.partnerLogoUrl}
                        alt={draft.partnerCompany}
                        crossOrigin="anonymous"
                        className={cn("h-9 w-auto max-w-[140px] object-contain", previewIsDark ? "brightness-0 invert" : "brightness-0")}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className={cn("flex items-start justify-between gap-5 border-b border-dashed pb-5", previewIsDark ? "border-white/10" : "border-slate-200")}>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src={draft.logoUrl || "/logo.svg"}
                  alt={draft.issuerName}
                  crossOrigin="anonymous"
                  style={{ height: `${Math.max(18, Math.round(logoHeight * 0.7))}px` }}
                  className={cn("w-auto max-w-[180px] object-contain", previewIsDark ? "brightness-0 invert" : "brightness-0")}
                />
                <div>
                  <p className={cn("text-[10px] uppercase tracking-[0.24em]", previewIsDark ? "text-white/42" : "text-slate-400")}>Invoice continuation</p>
                  <p className={cn("mt-1 text-lg font-semibold", previewIsDark ? "text-white" : "text-slate-950")}>{draft.number}</p>
                </div>
              </div>
              <p className={cn("mt-3 text-sm", previewIsDark ? "text-white/56" : "text-slate-600")}>
                {draft.clientCompany} · {draft.clientName}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-[11px]", previewIsDark ? "text-white/42" : "text-slate-500")}>
                Page {page.pageNumber} of {totalPages}
              </p>
            </div>
          </div>
        )}

        {page.lineItems.length ? (
          <div
            style={{ borderRadius: `${itemCornerRadius}px` }}
            className={cn(page.showFullHeader ? "mt-6" : "mt-5", "overflow-hidden border border-dashed", previewIsDark ? "border-white/10" : "border-slate-200")}
          >
            <table className="w-full border-collapse text-left">
              <thead className={previewIsDark ? "bg-white/4" : "bg-slate-50"}>
                <tr className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/50" : "text-slate-500")}>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {page.lineItems.map((item) => (
                  <tr key={item.id} className={cn("align-top border-t border-dashed", previewIsDark ? "border-white/10" : "border-slate-200")}>
                    <td className="px-4 py-4">
                      <p className={cn("text-sm font-medium", previewIsDark ? "text-white" : "text-slate-950")}>{item.title}</p>
                      {item.description ? (
                        <p className={cn("mt-1 text-[12px] leading-relaxed", previewIsDark ? "text-white/46" : "text-slate-500")}>{item.description}</p>
                      ) : null}
                    </td>
                    <td className={cn("px-4 py-4 text-sm", previewIsDark ? "text-white/68" : "text-slate-600")}>{item.quantity}</td>
                    <td className={cn("px-4 py-4 text-sm", previewIsDark ? "text-white/68" : "text-slate-600")}>{formatMoney(item.rate, draft.currency)}</td>
                    <td className={cn("px-4 py-4 text-right text-sm font-medium", previewIsDark ? "text-white" : "text-slate-950")}>
                      {formatMoney(getInvoiceLineAmount(item), draft.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {page.showSummary ? (
          <div className={cn(page.lineItems.length ? "mt-6" : "mt-auto pt-6")}>
            <hr className={cn("border-0 border-t border-dashed", previewIsDark ? "border-white/14" : "border-slate-300")} />
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)_130px]">
              <div>
                <p className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/42" : "text-slate-400")}>Notes</p>
                <p className={cn("mt-2 text-[13px] leading-relaxed", previewIsDark ? "text-white/70" : "text-slate-700")}>
                  {draft.notes || "No note added yet."}
                </p>
                <p className={cn("mt-3 text-[12px]", previewIsDark ? "text-white/52" : "text-slate-600")}>
                  {draft.paymentTerms} · Tax {draft.taxRate.toFixed(1)}% · {draft.currency}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className={cn("flex items-center justify-between gap-3", previewIsDark ? "text-white/60" : "text-slate-600")}>
                  <span>Subtotal</span>
                  <span className={previewIsDark ? "text-white" : "text-slate-950"}>{formatMoney(currentTotals.subtotal, draft.currency)}</span>
                </div>
                <div className={cn("flex items-center justify-between gap-3", previewIsDark ? "text-white/60" : "text-slate-600")}>
                  <span>Tax</span>
                  <span className={previewIsDark ? "text-white" : "text-slate-950"}>{formatMoney(currentTotals.tax, draft.currency)}</span>
                </div>
                <div className={cn("flex items-center justify-between gap-3 border-t border-dashed pt-3", previewIsDark ? "border-white/10" : "border-slate-200")}>
                  <span className={cn("text-[10px] uppercase tracking-[0.22em]", previewIsDark ? "text-white/42" : "text-slate-500")}>Total</span>
                  <span className={cn("text-xl font-semibold tracking-[-0.04em]", previewIsDark ? "text-white" : "text-slate-950")}>
                    {formatMoney(currentTotals.total, draft.currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div
                  className={cn(
                    "relative flex h-[108px] w-[108px] items-center justify-center rounded-[16px] border p-2",
                    previewIsDark ? "border-white/12 bg-white/[0.02]" : "border-slate-300 bg-white",
                  )}
                >
                  <div className={cn("absolute inset-2 rounded-[12px]", previewIsDark ? "bg-[radial-gradient(circle_at_20%_20%,rgba(205,255,4,0.08),transparent_60%)]" : "bg-[radial-gradient(circle_at_20%_20%,rgba(15,23,42,0.06),transparent_60%)]")} />
                  {publicStatusQrCode ? (
                    <>
                      <img src={publicStatusQrCode} alt="Invoice status QR code" className="h-full w-full rounded-[10px]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn("rounded-[10px] border border-white/20 p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]", previewIsDark ? "bg-[#111827]" : "bg-white")}>
                          <img src="/logo.svg" alt="Square logo" className={cn("h-4 w-auto", previewIsDark ? "brightness-0 invert" : "brightness-0")} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={cn("text-center text-[9px]", previewIsDark ? "text-white/45" : "text-slate-500")}>
                      Save invoice
                      <br />
                      to generate QR
                    </div>
                  )}
                </div>
                <p className={cn("text-right text-[9px] uppercase tracking-[0.18em]", previewIsDark ? "text-white/42" : "text-slate-500")}>
                  {isOfficialInvoice ? "Official invoice" : "Draft / Proforma"}
                </p>
                {publicStatusUrl ? (
                  <p className={cn("max-w-[180px] text-right text-[9px]", previewIsDark ? "text-white/34" : "text-slate-500")}>
                    Scan to verify status
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("mt-auto border-t border-dashed pt-4 text-right text-[11px]", previewIsDark ? "border-white/10 text-white/42" : "border-slate-200 text-slate-500")}>
            Continued on next page · {page.pageNumber}/{totalPages}
          </div>
        )}
      </div>
    </div>
  )
}

function CompactField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[9px] uppercase tracking-[0.24em] text-white/42">{label}</span>
      {children}
    </label>
  )
}

function InvoiceWorkspaceSkeleton() {
  return (
    <div className="space-y-3 p-3">
      <Skeleton className="h-14 w-full rounded-[16px]" />
      <Skeleton className="h-[520px] w-full rounded-[16px]" />
    </div>
  )
}

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
  data: AdminInvoiceSnapshot | null
  system: AdminSystemSnapshot | null
  isLoading: boolean
  invoiceError: string | null
  activeInvoiceId: string | null
  onCreateInvoice: (payload: CreateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>
  onGetInvoiceBin: () => Promise<AdminInvoiceSnapshot>
  onUpdateInvoice: (invoiceId: string, payload: UpdateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>
  onDeleteInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>
  onRestoreInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>
  onResendInvoice: (
    invoiceId: string,
    payload?: ResendAdminInvoiceInput,
  ) => Promise<AdminInvoiceSnapshot>
  onReviewInvoice: (
    invoiceId: string,
    payload: ReviewAdminInvoiceInput,
  ) => Promise<AdminInvoiceReviewResponse>
}) {
  const [libraryMode, setLibraryMode] = useState<InvoiceLibraryMode>("active")
  const [viewportMode, setViewportMode] = useState<InvoiceViewportMode>("list")
  const [editorMode, setEditorMode] = useState<InvoiceEditorMode>("edit")
  const [selectedListInvoiceId, setSelectedListInvoiceId] = useState<string>("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [draft, setDraft] = useState<InvoiceDraft>(() => getNewBlankInvoice([]))
  const [binSnapshot, setBinSnapshot] = useState<AdminInvoiceSnapshot | null>(null)
  const [isBinLoading, setIsBinLoading] = useState(false)
  const [binError, setBinError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [previewScale, setPreviewScale] = useState<PreviewScale>("fit")
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0)
  const [isPageRailExpanded, setIsPageRailExpanded] = useState(false)
  const [publicStatusOrigin, setPublicStatusOrigin] = useState("")
  const [publicStatusQrCode, setPublicStatusQrCode] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<AdminInvoiceAiReview | null>(null)
  const [resendComposer, setResendComposer] = useState<ResendComposerState>({
    isOpen: false,
    invoiceId: "",
    invoiceNumber: "",
    subject: "",
    contextNote: "",
  })
  const [isResendSubmitting, setIsResendSubmitting] = useState(false)
  const exportPageRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const activeInvoices = React.useMemo(
    () => (data?.invoices ?? []).map(mapAdminInvoiceToDraft),
    [data],
  )
  const archivedInvoices = React.useMemo(
    () => (binSnapshot?.invoices ?? []).map(mapAdminInvoiceToDraft),
    [binSnapshot],
  )
  const visibleInvoices = libraryMode === "active" ? activeInvoices : archivedInvoices
  const isMutating = isSaving || isReviewing || Boolean(activeInvoiceId)
  const previewIsDark = draft.displayVariant === "dark"
 
  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )
  const previewFilename = sanitizeFilename(draft.number)
  const publicStatusBaseUrl = publicStatusOrigin || process.env.NEXT_PUBLIC_APP_URL || ""
  const publicStatusUrl = draft.publicStatusToken && publicStatusBaseUrl
    ? `${publicStatusBaseUrl}/invoice-status/${draft.publicStatusToken}`
    : ""

  useEffect(() => {
    if (!feedback) {
      return undefined
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicStatusOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!publicStatusUrl) {
      setPublicStatusQrCode(null)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const qr = await import("qrcode")
        const dataUrl = await qr.toDataURL(publicStatusUrl, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 220,
          color: {
            dark: previewIsDark ? "#cdff04" : "#0b1220",
            light: previewIsDark ? "#020617" : "#ffffff",
          },
        })

        if (!cancelled) {
          setPublicStatusQrCode(dataUrl)
        }
      } catch {
        if (!cancelled) {
          setPublicStatusQrCode(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [previewIsDark, publicStatusUrl])

  useEffect(() => {
    if (!visibleInvoices.length) {
      setSelectedListInvoiceId("")
      return
    }

    setSelectedListInvoiceId((current) =>
      visibleInvoices.some((invoice) => invoice.id === current) ? current : visibleInvoices[0].id,
    )
  }, [visibleInvoices])

  useEffect(() => {
    if (viewportMode !== "editor" || editorMode !== "edit" || isDirty) {
      return
    }

    const next = activeInvoices.find((invoice) => invoice.id === selectedInvoiceId)
    if (!next) {
      setViewportMode("list")
      return
    }

    setDraft(cloneInvoice(next))
    setReviewResult(next.aiReview || null)
  }, [activeInvoices, editorMode, isDirty, selectedInvoiceId, viewportMode])

  const loadBin = React.useCallback(
    async (force = false) => {
      if (isBinLoading || (!force && binSnapshot)) {
        return
      }

      setIsBinLoading(true)
      setBinError(null)
      try {
        const snapshot = await onGetInvoiceBin()
        setBinSnapshot(snapshot)
      } catch (error) {
        setBinError(error instanceof Error ? error.message : "Failed to load invoice bin")
      } finally {
        setIsBinLoading(false)
      }
    },
    [binSnapshot, isBinLoading, onGetInvoiceBin],
  )

  useEffect(() => {
    if (libraryMode !== "bin" || binSnapshot) {
      return
    }

    void loadBin()
  }, [binSnapshot, libraryMode, loadBin])

  const selectedListInvoice = visibleInvoices.find((invoice) => invoice.id === selectedListInvoiceId) || null
  const currentTotals = getInvoiceTotals(draft)
  const previewPages = React.useMemo(() => buildInvoicePreviewPages(draft), [draft])
  const activePreviewPage = previewPages[currentPreviewPage] || previewPages[0]
  const showPageRail = previewPages.length > 1
  const shouldRenderExportPages = isExporting !== null

  useEffect(() => {
    setCurrentPreviewPage((current) => Math.min(current, Math.max(previewPages.length - 1, 0)))
  }, [previewPages.length])

  useEffect(() => {
    if (!showPageRail) {
      setIsPageRailExpanded(false)
    }
  }, [showPageRail])

  if (isLoading && !data) {
    return <InvoiceWorkspaceSkeleton />
  }

  function syncFromSnapshot(snapshot: AdminInvoiceSnapshot, preferredInvoiceId?: string, nextViewportMode?: InvoiceViewportMode) {
    const mapped = snapshot.invoices.map(mapAdminInvoiceToDraft)
    const savedInvoice =
      (preferredInvoiceId && mapped.find((invoice) => invoice.id === preferredInvoiceId)) ||
      mapped[0] ||
      null

    if (savedInvoice) {
      setSelectedListInvoiceId(savedInvoice.id)
      setSelectedInvoiceId(savedInvoice.id)
      setDraft(cloneInvoice(savedInvoice))
      setReviewResult(savedInvoice.aiReview || null)
      setEditorMode("edit")
    } else {
      setSelectedListInvoiceId("")
      setSelectedInvoiceId("")
    }

    setViewportMode(nextViewportMode || viewportMode)
    setCurrentPreviewPage(0)
    setIsDirty(false)
  }

  function startNewInvoice() {
    if (isMutating) {
      return
    }

    const nextDraft = getNewBlankInvoice(activeInvoices)
    setLibraryMode("active")
    setViewportMode("editor")
    setEditorMode("new")
    setSelectedInvoiceId(nextDraft.id)
    setDraft(nextDraft)
    setPreviewScale("fit")
    setCurrentPreviewPage(0)
    setReviewResult(null)
    setIsDirty(true)
    setFeedback("New invoice draft ready")
  }

  function openEditor(invoice: InvoiceDraft, scale: PreviewScale = "fit") {
    if (isMutating) {
      return
    }

    setViewportMode("editor")
    setEditorMode("edit")
    setSelectedListInvoiceId(invoice.id)
    setSelectedInvoiceId(invoice.id)
    setDraft(cloneInvoice(invoice))
    setPreviewScale(scale)
    setCurrentPreviewPage(0)
    setReviewResult(invoice.aiReview || null)
    setIsDirty(false)
    setFeedback(`Opened ${invoice.number}`)
  }

  function backToList() {
    if (isMutating) {
      return
    }

    setViewportMode("list")
    setIsDirty(false)
    setFeedback("Back to invoices")
  }

  function updateDraft(patch: Partial<InvoiceDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setIsDirty(true)
  }

  function updateLineItem(itemId: string, patch: Partial<InvoiceLineItem>) {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }))
    setIsDirty(true)
  }

  function addLineItem() {
    setDraft((current) => ({
      ...current,
      lineItems: [...current.lineItems, buildLineItem()],
    }))
    setIsDirty(true)
  }

  function removeLineItem(itemId: string) {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.filter((item) => item.id !== itemId),
    }))
    setIsDirty(true)
  }

  function handleLineItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    setDraft((current) => {
      const oldIndex = current.lineItems.findIndex((item) => item.id === active.id)
      const newIndex = current.lineItems.findIndex((item) => item.id === over.id)
      if (oldIndex < 0 || newIndex < 0) {
        return current
      }
      return {
        ...current,
        lineItems: arrayMove(current.lineItems, oldIndex, newIndex),
      }
    })
    setIsDirty(true)
  }

  async function saveDraft(returnToList = false) {
    if (isMutating) {
      return
    }

    setIsSaving(true)
    try {
      const payload = mapDraftToInvoicePayload(draft)
      const snapshot =
        editorMode === "new"
          ? await onCreateInvoice(payload)
          : await onUpdateInvoice(draft.id, payload)
      const preferredId = editorMode === "new" ? snapshot.invoices[0]?.id : draft.id
      syncFromSnapshot(snapshot, preferredId, returnToList ? "list" : "editor")
      setFeedback(editorMode === "new" ? `Created ${draft.number}` : `Saved ${draft.number}`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to save invoice")
    } finally {
      setIsSaving(false)
    }
  }

  async function moveInvoiceToBin(invoiceId: string) {
    if (isMutating) {
      return
    }

    try {
      const snapshot = await onDeleteInvoice(invoiceId)
      syncFromSnapshot(snapshot, snapshot.invoices[0]?.id, "list")
      if (binSnapshot || libraryMode === "bin") {
        await loadBin(true)
      }
      if (selectedInvoiceId === invoiceId) {
        setViewportMode("list")
      }
      setFeedback("Invoice moved to bin")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to move invoice to bin")
    }
  }

  async function restoreInvoice(invoiceId: string) {
    if (isMutating) {
      return
    }

    try {
      const snapshot = await onRestoreInvoice(invoiceId)
      syncFromSnapshot(snapshot, invoiceId, "list")
      await loadBin(true)
      setFeedback("Invoice restored")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to restore invoice")
    }
  }

  async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    if (isMutating) {
      return
    }

    try {
      const snapshot = await onUpdateInvoice(invoiceId, { status })
      syncFromSnapshot(snapshot, invoiceId, viewportMode)
      setFeedback(`Marked ${statusMeta[status].label.toLowerCase()}`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to update status")
    }
  }

  function openResendComposer(invoice: InvoiceDraft) {
    setResendComposer({
      isOpen: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      subject: getInvoiceEmailSubject(invoice),
      contextNote: getInvoiceEmailContext(invoice),
    })
  }

  function closeResendComposer() {
    if (isResendSubmitting) {
      return
    }
    setResendComposer((current) => ({
      ...current,
      isOpen: false,
    }))
  }

  async function submitResendComposer() {
    if (isMutating || isResendSubmitting || !resendComposer.invoiceId) {
      return
    }

    setIsResendSubmitting(true)
    try {
      const snapshot = await onResendInvoice(resendComposer.invoiceId, {
        subject: resendComposer.subject.trim() || undefined,
        contextNote: resendComposer.contextNote.trim() || undefined,
      })
      syncFromSnapshot(snapshot, resendComposer.invoiceId, viewportMode)
      setResendComposer((current) => ({ ...current, isOpen: false }))
      setFeedback("Invoice resent to client")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to resend invoice")
    } finally {
      setIsResendSubmitting(false)
    }
  }

  async function runReview() {
    if (isMutating || editorMode === "new") {
      return
    }

    setIsReviewing(true)
    try {
      const result = await onReviewInvoice(draft.id, {
        tone: "professional",
        apply: false,
        instruction: "Check invoice clarity, payment terms, and line-item readability.",
      })
      setReviewResult(result.review)
      syncFromSnapshot(result.snapshot, draft.id, "editor")
      setFeedback("Invoice review ready")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to run review")
    } finally {
      setIsReviewing(false)
    }
  }

  async function exportInvoice(format: ExportFormat) {
    if (!activePreviewPage) {
      setFeedback("Preview is not ready yet")
      return
    }

    setIsExporting(format)
    try {
      const backgroundColor = previewIsDark ? "#020617" : "#ffffff"
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve())
        })
      })
      if (format === "pdf") {
        const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")])
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
        let addedPage = false

        for (const page of previewPages) {
          const pageNode = exportPageRefs.current[page.id]
          if (!pageNode) {
            continue
          }

          const image = await toPng(pageNode, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor,
          })

          if (addedPage) {
            pdf.addPage("a4", "portrait")
          }

          pdf.addImage(image, "PNG", 0, 0, 210, 297)
          addedPage = true
        }

        pdf.save(`${previewFilename}.pdf`)
      } else if (format === "png") {
        const { toPng } = await import("html-to-image")
        const pageNode = exportPageRefs.current[activePreviewPage.id]
        if (!pageNode) {
          throw new Error("Selected page is not ready yet")
        }
        const image = await toPng(pageNode, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor,
        })
        downloadDataUrl(image, `${previewFilename}-page-${activePreviewPage.pageNumber}.png`)
      } else {
        const { toJpeg } = await import("html-to-image")
        const pageNode = exportPageRefs.current[activePreviewPage.id]
        if (!pageNode) {
          throw new Error("Selected page is not ready yet")
        }
        const image = await toJpeg(pageNode, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor,
          quality: 0.95,
        })
        downloadDataUrl(image, `${previewFilename}-page-${activePreviewPage.pageNumber}.jpeg`)
      }
      setFeedback(`Downloaded ${format.toUpperCase()}`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to export invoice")
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="space-y-3 p-3">
      <div className="rounded-[22px] border border-white/10 bg-[rgba(9,12,18,0.82)] px-3 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/38">Invoice Desk</p>
            <h2 className="mt-1 text-sm font-semibold text-white">
              {viewportMode === "list" ? "Invoice list" : `${draft.number} editor`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={glassSegmentedControlClass}>
              <button
                type="button"
                onClick={() => setLibraryMode("active")}
                className={cn(
                  glassSegmentedItemClass,
                  libraryMode === "active"
                    ? glassSegmentedItemActiveClass
                    : "",
                )}
              >
                Active {data?.metrics.total ?? activeInvoices.length}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryMode("bin")
                  void loadBin()
                }}
                className={cn(
                  glassSegmentedItemClass,
                  "border-l border-white/10",
                  libraryMode === "bin"
                    ? glassSegmentedItemActiveClass
                    : "",
                )}
              >
                Bin {binSnapshot?.metrics.total ?? archivedInvoices.length}
              </button>
            </div>

          {viewportMode === "list" ? (
            <button
              type="button"
              onClick={startNewInvoice}
              disabled={isMutating || libraryMode === "bin"}
              className={compactAccentButtonClassName}
            >
              <Add variant="Bulk" size={14} color="currentColor" />
              New invoice
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={backToList}
                disabled={isMutating}
                className={compactPillButtonClassName}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void saveDraft(false)}
                disabled={isMutating || !isDirty}
                className={compactPillButtonClassName}
              >
                {isSaving ? "Saving" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => void saveDraft(true)}
                disabled={isMutating || !isDirty}
                className={compactAccentButtonClassName}
              >
                <TickCircle variant="Bulk" size={14} color="currentColor" />
                {isSaving ? "Saving" : "Save and back"}
              </button>
            </>
          )}
        </div>
        </div>
        <hr className="divider-dashed mt-3" />
      </div>

      {feedback ? (
        <div className="rounded-[18px] border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[11px] text-sky-100">
          {feedback}
        </div>
      ) : null}

      {viewportMode === "list" ? (
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(9,12,18,0.84)] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Compact queue</p>
                <p className="mt-1 text-[11px] text-white/58">
                  Double-click an invoice to open the editor and preview. Right-click for invoice operations.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Status</p>
                <p className="mt-1 text-[11px] text-white/58">
                  {libraryMode === "bin"
                    ? "Deleted invoices waiting for restore"
                    : system?.core.ok
                      ? system.core.service || "Core online"
                      : "Core syncing"}
                </p>
              </div>
            </div>
            <hr className="divider-dashed mt-3" />
          </div>

          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_90px_110px] border-b border-dashed border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] uppercase tracking-[0.22em] text-white/40">
            <span>Invoice</span>
            <span>Client</span>
            <span>Status</span>
            <span className="text-right">Total</span>
          </div>

          {invoiceError && libraryMode === "active" ? (
            <div className="border-b border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3 py-2 text-[11px] text-[#ffb49d]">
              {invoiceError}
            </div>
          ) : null}
          {binError && libraryMode === "bin" ? (
            <div className="border-b border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3 py-2 text-[11px] text-[#ffb49d]">
              {binError}
            </div>
          ) : null}

          {libraryMode === "bin" && isBinLoading ? (
            <div className="space-y-1 px-3 py-3">
              <Skeleton className="h-10 w-full rounded-[16px]" />
              <Skeleton className="h-10 w-full rounded-[16px]" />
              <Skeleton className="h-10 w-full rounded-[16px]" />
            </div>
          ) : visibleInvoices.length ? (
            <div>
              {visibleInvoices.map((invoice) => {
                const amount = getInvoiceTotals(invoice).total
                const selected = invoice.id === selectedListInvoiceId

                return (
                  <ContextMenu key={invoice.id}>
                    <ContextMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedListInvoiceId(invoice.id)}
                        onMouseDown={(event) => {
                          if (event.button === 2) {
                            setSelectedListInvoiceId(invoice.id)
                          }
                        }}
                        onDoubleClick={() => {
                          if (libraryMode === "active") {
                            openEditor(invoice)
                          }
                        }}
                        className={cn(
                          "mx-2 my-1 grid w-[calc(100%-1rem)] grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_90px_110px] items-center gap-3 rounded-[16px] border border-transparent px-3 py-2 text-left transition-colors",
                          selected
                            ? "border-[rgba(205,255,4,0.14)] bg-[rgba(205,255,4,0.08)]"
                            : "hover:border-white/10 hover:bg-white/[0.03]",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-white">{invoice.number}</p>
                          <p className="truncate text-[10px] text-white/42">
                            {libraryMode === "bin" && invoice.deletedAt
                              ? `Deleted ${formatDateLabel(invoice.deletedAt)}`
                              : `Due ${formatDateLabel(invoice.dueDate)}`}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] text-white/70">{invoice.clientCompany}</p>
                          <p className="truncate text-[10px] text-white/38">{invoice.clientName}</p>
                        </div>
                        <div>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <div className="text-right text-[11px] font-medium text-white">
                          {formatMoney(amount, invoice.currency)}
                        </div>
                      </button>
                    </ContextMenuTrigger>

                    <ContextMenuContent className={glassMenuContentClass}>
                      <ContextMenuLabel className={cn(glassMenuLabelClass, "text-[10px] uppercase tracking-[0.18em]")}>
                        {invoice.number}
                      </ContextMenuLabel>
                      {libraryMode === "active" ? (
                        <>
                          <ContextMenuItem inset onSelect={() => openEditor(invoice)}>
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem inset onSelect={() => openEditor(invoice, "large") }>
                            Make preview bigger
                          </ContextMenuItem>
                          <ContextMenuSeparator className={glassMenuSeparatorClass} />
                          <ContextMenuItem inset onSelect={() => void updateInvoiceStatus(invoice.id, "draft")}>
                            Mark as draft
                          </ContextMenuItem>
                          <ContextMenuItem inset onSelect={() => void updateInvoiceStatus(invoice.id, "paid")}>
                            Mark as paid
                          </ContextMenuItem>
                          <ContextMenuItem inset onSelect={() => openResendComposer(invoice)}>
                            Resend to client
                          </ContextMenuItem>
                          <ContextMenuSeparator className={glassMenuSeparatorClass} />
                          <ContextMenuItem
                            inset
                            onSelect={() => void moveInvoiceToBin(invoice.id)}
                            className={glassMenuDangerItemClass}
                          >
                            Move to bin
                          </ContextMenuItem>
                        </>
                      ) : (
                        <>
                          <ContextMenuItem inset onSelect={() => void restoreInvoice(invoice.id)}>
                            Restore
                          </ContextMenuItem>
                          {invoice.restoreUntil ? (
                            <div className="px-2 py-1 text-[10px] text-white/38">
                              Restore until {formatDateLabel(invoice.restoreUntil)}
                            </div>
                          ) : null}
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
            </div>
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-[12px] font-semibold text-white">
                {libraryMode === "bin" ? "Invoice bin is empty" : "No invoices yet"}
              </p>
              <p className="mt-1 text-[11px] text-white/52">
                {libraryMode === "bin"
                  ? "Deleted invoices will appear here for restore."
                  : "Create a new invoice to start working."}
              </p>
              {libraryMode === "active" ? (
                <button
                  type="button"
                  onClick={startNewInvoice}
                  className={cn(compactMiniAccentButtonClassName, "mt-3")}
                >
                  Create invoice
                </button>
              ) : null}
            </div>
          )}

          {selectedListInvoice ? (
            <div className="flex items-center justify-between border-t border-dashed border-white/10 px-3 py-2 text-[10px] text-white/42">
              <span>
                {selectedListInvoice.number}
                {selectedListInvoice.lastResentAt
                  ? ` · resent ${formatDateLabel(selectedListInvoice.lastResentAt)}`
                  : ""}
              </span>
              <span>Right click for actions</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(9,12,18,0.84)] shadow-[0_18px_50px_rgba(0,0,0,0.18)] xl:max-h-[calc(100vh-6.5rem)] xl:overflow-y-auto">
            <div className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Compact form</p>
                  <p className="mt-1 text-[11px] text-white/58">Maxmize flow with Opin.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewScale((current) => (current === "fit" ? "large" : "fit"))}
                    className={compactMiniButtonClassName}
                  >
                      {previewScale === "large" ? <Maximize size={14} variant="Bulk" color="currentColor" /> :<Maximize size={14} variant="Bold" color="currentColor" />}
                  </button>
                  {editorMode === "edit" ? (
                    <button
                      type="button"
                      onClick={() => void runReview()}
                      disabled={isMutating}
                      className={compactMiniButtonClassName}
                    >
                      {isReviewing ? "Reviewing" : "AI check"}
                    </button>
                  ) : null}
                </div>
              </div>
              <hr className="divider-dashed mt-3" />
            </div>

            {invoiceError ? (
              <div className="border-b border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3 py-2 text-[11px] text-[#ffb49d]">
                {invoiceError}
              </div>
            ) : null}

            <div className="grid gap-3 px-3 py-3">
              <div className="grid gap-2 rounded-[20px] border border-white/10 bg-black/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Brand and parties</p>
                  <button
                    type="button"
                    onClick={() => updateDraft({ logoUrl: "/logo.svg" })}
                    className={compactMiniButtonClassName}
                  >
                    Use Square logo
                  </button>
                </div>
                <hr className="divider-dashed" />
                <div className="grid gap-2">
                  <CompactField label="Issuer name">
                    <Input value={draft.issuerName} onChange={(event) => updateDraft({ issuerName: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Issuer email">
                    <Input value={draft.issuerEmail} onChange={(event) => updateDraft({ issuerEmail: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Logo path">
                    <Input value={draft.logoUrl} onChange={(event) => updateDraft({ logoUrl: event.target.value || "/logo.svg" })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Client company">
                    <Input value={draft.clientCompany} onChange={(event) => updateDraft({ clientCompany: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Client name">
                    <Input value={draft.clientName} onChange={(event) => updateDraft({ clientName: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Client email">
                    <Input value={draft.clientEmail} onChange={(event) => updateDraft({ clientEmail: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <div className="flex items-center justify-between rounded-[16px] border border-dashed border-white/12 px-2 py-1.5 text-[10px] text-white/68">
                    <span>Partner company</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(
                          draft.partnerEnabled
                            ? {
                                partnerEnabled: false,
                                partnerLabel: "Partner company",
                                partnerName: "",
                                partnerCompany: "",
                                partnerEmail: "",
                                partnerLogoUrl: "",
                              }
                            : { partnerEnabled: true },
                        )
                      }
                      className={cn(compactMiniButtonClassName, "h-6 px-2 text-[9px]")}
                    >
                      {draft.partnerEnabled ? "Remove" : "Add"}
                    </button>
                  </div>
                  {draft.partnerEnabled ? (
                    <div className="grid gap-2 rounded-[16px] border border-dashed border-white/10 p-2">
                      <CompactField label="Partner label">
                        <Input value={draft.partnerLabel} onChange={(event) => updateDraft({ partnerLabel: event.target.value })} className={compactInputClassName} />
                      </CompactField>
                      <CompactField label="Partner company">
                        <Input value={draft.partnerCompany} onChange={(event) => updateDraft({ partnerCompany: event.target.value })} className={compactInputClassName} />
                      </CompactField>
                      <CompactField label="Partner contact">
                        <Input value={draft.partnerName} onChange={(event) => updateDraft({ partnerName: event.target.value })} className={compactInputClassName} />
                      </CompactField>
                      <CompactField label="Partner email">
                        <Input value={draft.partnerEmail} onChange={(event) => updateDraft({ partnerEmail: event.target.value })} className={compactInputClassName} />
                      </CompactField>
                      <CompactField label="Partner logo">
                        <Input value={draft.partnerLogoUrl} onChange={(event) => updateDraft({ partnerLogoUrl: event.target.value })} className={compactInputClassName} />
                      </CompactField>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 rounded-[20px] border border-white/10 bg-black/20 p-2.5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Billing</p>
                <hr className="divider-dashed" />
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                  <CompactField label="Invoice number">
                    <Input value={draft.number} onChange={(event) => updateDraft({ number: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Status">
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft({ status: event.target.value as InvoiceStatus })}
                      className={compactInputClassName}
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status} value={status} className="bg-slate-950 text-white">
                          {statusMeta[status].label}
                        </option>
                      ))}
                    </select>
                  </CompactField>
                  <CompactField label="Issue date">
                    <Input type="date" value={draft.issueDate} onChange={(event) => updateDraft({ issueDate: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Due date">
                    <Input type="date" value={draft.dueDate} onChange={(event) => updateDraft({ dueDate: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                  <CompactField label="Currency">
                    <select
                      value={draft.currency}
                      onChange={(event) => updateDraft({ currency: event.target.value })}
                      className={compactInputClassName}
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency} className="bg-slate-950 text-white">
                          {currency}
                        </option>
                      ))}
                    </select>
                  </CompactField>
                  <CompactField label="Tax rate %">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={draft.taxRate}
                      onChange={(event) => updateDraft({ taxRate: parseNumberInput(event.target.value, 0) })}
                      className={compactInputClassName}
                    />
                  </CompactField>
                  <CompactField label="Paper style">
                    <select
                      value={draft.displayVariant}
                      onChange={(event) => updateDraft({ displayVariant: event.target.value as InvoiceDisplayVariant })}
                      className={compactInputClassName}
                    >
                      {invoiceDisplayVariants.map((variant) => (
                        <option key={variant} value={variant} className="bg-slate-950 text-white">
                          {variant === "light" ? "White" : "Black"}
                        </option>
                      ))}
                    </select>
                  </CompactField>
                  <CompactField label="Logo size">
                    <Input
                      type="number"
                      min="12"
                      max="72"
                      step="1"
                      value={draft.logoSize}
                      onChange={(event) => updateDraft({ logoSize: clampNumber(parseNumberInput(event.target.value, 36), 12, 72) })}
                      className={compactInputClassName}
                    />
                  </CompactField>
                  <CompactField label="Font size">
                    <Input
                      type="number"
                      min="10"
                      max="16"
                      step="1"
                      value={draft.fontSize}
                      onChange={(event) => updateDraft({ fontSize: clampNumber(parseNumberInput(event.target.value, 12), 10, 16) })}
                      className={compactInputClassName}
                    />
                  </CompactField>
                  <CompactField label="Items corner">
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="1"
                      value={draft.tableItemCornerRadius}
                      onChange={(event) =>
                        updateDraft({
                          tableItemCornerRadius: clampNumber(
                            parseNumberInput(event.target.value, 8),
                            0,
                            24,
                          ),
                        })
                      }
                      className={compactInputClassName}
                    />
                  </CompactField>
                  <CompactField label="Payment terms">
                    <Input value={draft.paymentTerms} onChange={(event) => updateDraft({ paymentTerms: event.target.value })} className={compactInputClassName} />
                  </CompactField>
                </div>
              </div>

              <div className="grid gap-2 rounded-[20px] border border-white/10 bg-black/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Line items</p>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className={compactMiniButtonClassName}
                  >
                    <Add variant="Bulk" size={14} color="currentColor" />
                    Add line
                  </button>
                </div>
                <hr className="divider-dashed" />
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleLineItemDragEnd}
                >
                  <SortableContext
                    items={draft.lineItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {draft.lineItems.map((item) => (
                        <SortableLineItemCard
                          key={item.id}
                          item={item}
                          onUpdateLineItem={updateLineItem}
                          onRemoveLineItem={removeLineItem}
                          compactInputClassName={compactInputClassName}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <div className="grid gap-2 rounded-[20px] border border-white/10 bg-black/20 p-2.5">
                <div className="flex items-center gap-2 text-white/80">
                  <DocumentText1 variant="Bulk" size={16} color="currentColor" />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Notes</p>
                </div>
                <hr className="divider-dashed" />
                <CompactField label="Client note">
                  <Textarea value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} className={compactTextareaClassName} />
                </CompactField>
                <CompactField label="Internal memo">
                  <Textarea value={draft.memo} onChange={(event) => updateDraft({ memo: event.target.value })} className={compactTextareaClassName} />
                </CompactField>
              </div>

              {reviewResult ? (
                <div className="grid gap-2 rounded-[20px] border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.07)] p-2.5">
                  <div className="flex items-center gap-2 text-white/80">
                    <Profile2User variant="Bulk" size={16} color="currentColor" />
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sq-brand-action)]">AI review</p>
                  </div>
                  <hr className="divider-dashed" />
                  <p className="text-[11px] font-medium text-white">{reviewResult.summary}</p>
                  <div className="grid gap-1 text-[10px] text-white/65">
                    {reviewResult.suggestions.slice(0, 3).map((suggestion) => (
                      <p key={suggestion}>{suggestion}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(9,12,18,0.84)] shadow-[0_18px_50px_rgba(0,0,0,0.18)] xl:sticky xl:top-3 xl:h-[calc(100vh-6.5rem)] xl:self-start">
            <div className="flex h-full min-h-0 flex-col">
              <div className="px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Preview</p>
                    <p className="mt-1 text-[11px] text-white/58">
                      New pages appear only on true overflow. The footer always stays on the final page.
                    </p>
                  </div>
                  <TooltipProvider delayDuration={0}>
                    <div className="flex flex-wrap gap-2">
                      {editorMode === "edit" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <button
                                type="button"
                                onClick={() => openResendComposer(draft)}
                                disabled={isMutating}
                                className={cn(compactMiniButtonClassName, "flex items-center h-9 rounded-full")}
                              >
                                <Airdrop size={14} variant="Bulk" color="currentColor" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Resend invoice</TooltipContent>
                        </Tooltip>
                      ) : null}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <button
                              type="button"
                              onClick={() => void exportInvoice("pdf")}
                              disabled={Boolean(isExporting)}
                              className={cn(compactMiniButtonClassName, "flex items-center h-9 rounded-full")}
                            >
                              {isExporting === "pdf" ? (
                                <Image
                                  className="animate-pulse duration-2000 ease-in-out"
                                  src="/static/pdf_icon.png"
                                  alt="pdf logo icon"
                                  width={14}
                                  height={14}
                                />
                              ) : (
                                <Image src="/static/pdf_icon.png" alt="pdf logo icon" width={14} height={14} />
                              )}
                            </button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Export as PDF</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <button
                              type="button"
                              onClick={() => void exportInvoice("png")}
                              disabled={Boolean(isExporting)}
                              className={cn(compactMiniButtonClassName, "flex items-center h-9 rounded-full")}
                            >
                              {isExporting === "png" ? (
                                <Image
                                  className="animate-pulse duration-2000 ease-in-out"
                                  src="/static/png_icon.png"
                                  alt="png logo"
                                  width={16}
                                  height={16}
                                />
                              ) : (
                                <Image src="/static/png_icon.png" alt="png logo" width={16} height={16} />
                              )}
                            </button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Export as PNG</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <button
                              type="button"
                              onClick={() => void exportInvoice("jpeg")}
                              disabled={Boolean(isExporting)}
                              className={cn(compactMiniButtonClassName, "flex items-center h-9 rounded-full")}
                            >
                              {isExporting === "jpeg" ? (
                                <Image
                                  className="animate-pulse duration-2000 ease-in-out"
                                  src="/static/jpg_icon.png"
                                  alt="jpg logo"
                                  width={16}
                                  height={16}
                                />
                              ) : (
                                <Image src="/static/jpg_icon.png" alt="jpg Logo" width={16} height={16} />
                              )}
                            </button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Export as JPG</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
                <hr className="divider-dashed mt-3" />
              </div>

              <div className="min-h-0 flex-1 overflow-hidden px-3 py-3">
                <div
                  className={cn(
                    "grid h-full gap-2",
                    showPageRail
                      ? isPageRailExpanded
                        ? "lg:grid-cols-[minmax(0,1fr)_112px]"
                        : "lg:grid-cols-[minmax(0,1fr)_40px]"
                      : "grid-cols-1",
                  )}
                >
                  <div className="min-h-0 overflow-auto pr-1">
                    <div className={cn("mx-auto", previewScale === "large" ? "max-w-[900px]" : "max-w-[720px]")}>
                      {activePreviewPage ? (
                        <InvoicePreviewPaper
                          draft={draft}
                          page={activePreviewPage}
                          totalPages={previewPages.length}
                          currentTotals={currentTotals}
                          previewIsDark={previewIsDark}
                          publicStatusUrl={publicStatusUrl}
                          publicStatusQrCode={publicStatusQrCode}
                        />
                      ) : null}
                    </div>
                  </div>

                  {showPageRail ? (
                    <div className="min-h-0 overflow-hidden rounded-[16px] border border-white/10 bg-black/10 p-1.5">
                      {isPageRailExpanded ? (
                        <>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[8px] uppercase tracking-[0.18em] text-white/44">Pages</p>
                            <button
                              type="button"
                              onClick={() => setIsPageRailExpanded(false)}
                              className={cn(compactMiniButtonClassName, "h-5 px-1.5 py-0.5 text-[8px]")}
                            >
                              Hide
                            </button>
                          </div>
                          <hr className="divider-dashed my-1.5" />
                          <div className="min-h-0 space-y-1.5 overflow-auto pr-0.5">
                            {previewPages.map((page, index) => (
                              <InvoicePreviewThumbnail
                                key={page.id}
                                page={page}
                                totalPages={previewPages.length}
                                isActive={index === currentPreviewPage}
                                previewIsDark={previewIsDark}
                                onSelect={() => setCurrentPreviewPage(index)}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsPageRailExpanded(true)}
                          className={cn(
                            glassButtonNeutralClass,
                            "inline-flex h-full w-full flex-col items-center justify-center rounded-[12px] border-dashed px-1 py-2 text-white/64",
                          )}
                        >
                          <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] font-medium">
                            {previewPages.length}
                          </span>
                          <span className="mt-1 text-[7px] uppercase tracking-[0.2em]">Pages</span>
                          <span className="mt-1 text-[7px] uppercase tracking-[0.2em] text-white/40">Open</span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {shouldRenderExportPages ? (
            <div aria-hidden className="pointer-events-none fixed left-[-240vw] top-0 opacity-0">
              {previewPages.map((page) => (
                <div key={`export-${page.id}`} className="w-[860px]">
                  <div
                    ref={(node) => {
                      if (node) {
                        exportPageRefs.current[page.id] = node
                      } else {
                        delete exportPageRefs.current[page.id]
                      }
                    }}
                  >
                    <InvoicePreviewPaper
                      draft={draft}
                      page={page}
                      totalPages={previewPages.length}
                      currentTotals={currentTotals}
                      previewIsDark={previewIsDark}
                      publicStatusUrl={publicStatusUrl}
                      publicStatusQrCode={publicStatusQrCode}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {resendComposer.isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeResendComposer}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label="Close compose modal"
          />
          <div className="relative z-[121] w-full max-w-[560px] rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,16,24,0.98),rgba(9,12,18,0.96))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Compose invoice email</p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              {resendComposer.invoiceNumber || "Invoice"} to client
            </h3>
            <hr className="divider-dashed my-3" />

            <div className="grid gap-3">
              <CompactField label="Subject">
                <Input
                  value={resendComposer.subject}
                  onChange={(event) =>
                    setResendComposer((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  className={compactInputClassName}
                  placeholder="Invoice subject"
                />
              </CompactField>
              <CompactField label="Context">
                <Textarea
                  value={resendComposer.contextNote}
                  onChange={(event) =>
                    setResendComposer((current) => ({
                      ...current,
                      contextNote: event.target.value,
                    }))
                  }
                  className={cn(compactTextareaClassName, "min-h-[150px]")}
                  placeholder="Add a short context before sending this invoice"
                />
              </CompactField>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeResendComposer}
                disabled={isResendSubmitting}
                className={compactPillButtonClassName}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitResendComposer()}
                disabled={isMutating || isResendSubmitting}
                className={compactAccentButtonClassName}
              >
                {isResendSubmitting ? "Sending..." : "Send to client"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
