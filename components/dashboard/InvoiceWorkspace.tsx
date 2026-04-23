"use client"

import React, { useEffect, useState } from "react"
import {
  Add,
  Calendar,
  DollarSquare,
  DocumentText1,
  Edit2,
  MoneyRecive,
  Profile2User,
  ReceiptSquare,
  Sort,
  TickCircle,
  Trash,
  WalletMoney,
  More,
} from "iconsax-react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type {
  AdminInvoice,
  AdminInvoiceAiReview,
  AdminInvoiceReviewResponse,
  AdminInvoiceSnapshot,
  AdminSystemSnapshot,
  CreateAdminInvoiceInput,
  ReviewAdminInvoiceInput,
  UpdateAdminInvoiceInput,
} from "@/lib/admin-types"
import { cn } from "@/lib/utils"

import { SurfaceCard } from "./SurfaceCard"
import { Skeleton } from "../ui/skeleton"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

const invoiceStatuses = ["draft", "sent", "paid", "overdue", "proforma"] as const
const invoiceFilters = ["all", ...invoiceStatuses] as const
const invoiceDisplayVariants = ["light", "dark"] as const

type InvoiceStatus = (typeof invoiceStatuses)[number]
type InvoiceFilter = (typeof invoiceFilters)[number]
type InvoiceDisplayVariant = (typeof invoiceDisplayVariants)[number]

type InvoiceLineItem = {
  id: string
  description: string
  quantity: number
  rate: number
  discountPercent: number
}

type InvoiceDraft = {
  id: string
  number: string
  status: InvoiceStatus
  issuerName: string
  issuerEmail: string
  logoUrl: string
  displayVariant: InvoiceDisplayVariant
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
  lineItems: InvoiceLineItem[]
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
    tone: "text-white/70",
    border: "border-white/10",
    bg: "bg-white/4",
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

const currencyOptions = ["USD", "TZS", "KES", "EUR"] as const

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toDateInputValue(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000)
}

function parseNumberInput(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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

function buildLineItem(seed: Partial<InvoiceLineItem> & { description: string }): InvoiceLineItem {
  return {
    id: seed.id || createId("line"),
    description: seed.description,
    quantity: seed.quantity ?? 1,
    rate: seed.rate ?? 0,
    discountPercent: seed.discountPercent ?? 0,
  }
}

function buildInvoice(seed: Partial<InvoiceDraft> & { number: string; status: InvoiceStatus }): InvoiceDraft {
  const issueDate = seed.issueDate ? new Date(seed.issueDate) : new Date()
  const dueDate = seed.dueDate ? new Date(seed.dueDate) : addDays(issueDate, 14)

  return {
    id: seed.id || createId("invoice"),
    number: seed.number,
    status: seed.status,
    issuerName: seed.issuerName || "Square Experience",
    issuerEmail: seed.issuerEmail || "billing@squareexp.com",
    logoUrl: seed.logoUrl || "/logo.svg",
    displayVariant: seed.displayVariant || "light",
    clientName: seed.clientName || "New client",
    clientCompany: seed.clientCompany || "Client company",
    clientEmail: seed.clientEmail || "finance@client.com",
    partnerEnabled: seed.partnerEnabled || false,
    partnerLabel: seed.partnerLabel || "Delivery partner",
    partnerName: seed.partnerName || "",
    partnerCompany: seed.partnerCompany || "",
    partnerEmail: seed.partnerEmail || "",
    partnerLogoUrl: seed.partnerLogoUrl || "",
    issueDate: toDateInputValue(issueDate),
    dueDate: toDateInputValue(dueDate),
    currency: seed.currency || "USD",
    taxRate: seed.taxRate ?? 18,
    paymentTerms: seed.paymentTerms || "Net 14",
    notes: seed.notes || "Thanks for choosing Square. Please settle by the due date.",
    memo: seed.memo || "Internal memo for the admin team.",
    aiReview: null,
    lineItems: (seed.lineItems || [
      buildLineItem({
        description: "Invoice setup and discovery",
        quantity: 1,
        rate: 1800,
        discountPercent: 0,
      }),
      buildLineItem({
        description: "Workspace launch support",
        quantity: 2,
        rate: 650,
        discountPercent: 10,
      }),
    ]).map(cloneLineItem),
  }
}

function getInvoiceLineAmount(item: InvoiceLineItem) {
  const gross = item.quantity * item.rate
  const discount = gross * (item.discountPercent / 100)
  return gross - discount
}

function getInvoiceTotals(invoice: InvoiceDraft) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const discount = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate * (item.discountPercent / 100),
    0,
  )
  const taxable = Math.max(subtotal - discount, 0)
  const tax = taxable * (invoice.taxRate / 100)
  const total = taxable + tax

  return {
    subtotal,
    discount,
    tax,
    total,
  }
}

function getInvoiceCounts(invoices: InvoiceDraft[]) {
  return invoiceStatuses.reduce<Record<InvoiceStatus, number>>((acc, status) => {
    acc[status] = invoices.filter((invoice) => invoice.status === status).length
    return acc
  }, {} as Record<InvoiceStatus, number>)
}

function getNextInvoiceNumber(invoices: Pick<InvoiceDraft, "number">[]) {
  const nextSeed = invoices.reduce((max, invoice) => {
    const match = invoice.number.match(/(\d+)(?!.*\d)/)
    if (!match) {
      return max
    }

    const numeric = Number(match[1])
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max
  }, 1037)

  return `SQ-INV-${nextSeed + 1}`
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
    clientName: "New client",
    clientCompany: "Client company",
    clientEmail: "finance@client.com",
    paymentTerms: "Net 14",
    notes: "Use this draft to prepare the final invoice package.",
    memo: "Internal note for the team before sending.",
    lineItems: [
      buildLineItem({
        description: "Discovery call and scoping",
        quantity: 1,
        rate: 0,
        discountPercent: 0,
      }),
    ],
  })
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

function mapAdminInvoiceToDraft(invoice: AdminInvoice): InvoiceDraft {
  return {
    id: invoice.id,
    number: invoice.invoiceNumber,
    status: invoice.status,
    issuerName: invoice.issuerName || "Square Experience",
    issuerEmail: invoice.issuerEmail || "billing@squareexp.com",
    logoUrl: invoice.logoUrl || "/logo.svg",
    displayVariant: invoice.displayVariant || "light",
    clientName: invoice.clientName,
    clientCompany: invoice.clientCompany || "Client company",
    clientEmail: invoice.clientEmail,
    partnerEnabled: invoice.partnerEnabled || false,
    partnerLabel: invoice.partnerLabel || "Delivery partner",
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
    lineItems:
      invoice.items.length > 0
        ? invoice.items
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((item) =>
              buildLineItem({
                id: item.id,
                description: item.description
                  ? `${item.title} · ${item.description}`
                  : item.title,
                quantity: item.quantity,
                rate: item.unitPrice,
                discountPercent: 0,
              }),
            )
        : [
            buildLineItem({
              description: "New line item",
              quantity: 1,
              rate: 0,
              discountPercent: 0,
            }),
          ],
  }
}

function mapDraftToInvoicePayload(
  draft: InvoiceDraft,
): CreateAdminInvoiceInput {
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
    taxRate: draft.taxRate,
    items: draft.lineItems.map((item, index) => ({
      id: item.id,
      title: item.description || `Line item ${index + 1}`,
      description:
        item.discountPercent > 0
          ? `Includes ${item.discountPercent.toFixed(0)}% line discount.`
          : undefined,
      quantity: item.quantity,
      unitPrice: Number((item.rate * (1 - item.discountPercent / 100)).toFixed(2)),
      sortOrder: index,
    })),
  }
}

function InvoiceField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</p>
        {hint ? <p className="text-[11px] text-white/35">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

function InvoiceBadge({ status, inverse = false }: { status: InvoiceStatus; inverse?: boolean }) {
  const meta = statusMeta[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
        inverse ? "border-slate-200 bg-slate-50 text-slate-700" : cn(meta.border, meta.bg, meta.tone),
      )}
    >
      {meta.label}
    </span>
  )
}

function InvoiceStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{
    size?: number | string
    color?: string
    variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone"
  }>
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">{label}</p>
          <p className="mt-1.5 text-lg font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/10 bg-white/4 text-white/70">
          <Icon variant="Bulk" size={18} color="currentColor" />
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-white/48">{hint}</p>
    </div>
  )
}

function SortableLineItemRow({
  item,
  currency,
  disabled,
  onChange,
  onRemove,
}: {
  item: InvoiceLineItem
  currency: string
  disabled: boolean
  onChange: (itemId: string, patch: Partial<InvoiceLineItem>) => void
  onRemove: (itemId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.75 : 1,
      }}
      className={cn(
        "grid gap-2 rounded-[16px] border border-white/10 bg-black/20 p-2.5 xl:grid-cols-[auto_minmax(0,1.55fr)_76px_84px_88px_88px_auto]",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/4 text-white/55 disabled:cursor-not-allowed"
        {...attributes}
        {...listeners}
      >
        <Sort variant="Bulk" size={16} color="currentColor" />
      </button>

      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Description</p>
        <Input
          value={item.description}
          onChange={(event) => onChange(item.id, { description: event.target.value })}
          disabled={disabled}
          className="h-8 border-white/10 bg-white/4 text-sm text-white placeholder:text-white/30 focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
        />
      </div>

      <InvoiceField label="Qty">
        <Input
          type="number"
          min="0"
          step="0.1"
          value={item.quantity}
          onChange={(event) => onChange(item.id, { quantity: parseNumberInput(event.target.value, 0) })}
          disabled={disabled}
          className="h-8 border-white/10 bg-white/4 text-white focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
        />
      </InvoiceField>

      <InvoiceField label="Rate">
        <Input
          type="number"
          min="0"
          step="1"
          value={item.rate}
          onChange={(event) => onChange(item.id, { rate: parseNumberInput(event.target.value, 0) })}
          disabled={disabled}
          className="h-8 border-white/10 bg-white/4 text-white focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
        />
      </InvoiceField>

      <InvoiceField label="Disc %" hint="Per line">
        <Input
          type="number"
          min="0"
          max="100"
          step="1"
          value={item.discountPercent}
          onChange={(event) =>
            onChange(item.id, { discountPercent: parseNumberInput(event.target.value, 0) })
          }
          disabled={disabled}
          className="h-8 border-white/10 bg-white/4 text-white focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
        />
      </InvoiceField>

      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Amount</p>
        <div className="flex h-8 items-center rounded-md border border-white/10 bg-white/4 px-3 text-sm font-medium text-white">
          {formatMoney(getInvoiceLineAmount(item), currency)}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onRemove(item.id)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/4 text-white/55 transition-colors hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed"
      >
        <Trash variant="Bulk" size={16} color="currentColor" />
      </button>
    </div>
  )
}

function InvoiceWorkspaceSkeleton() {
  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <SurfaceCard eyebrow="Invoice Engine" title="Preparing invoice workspace">
        <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-[18px]" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-24 rounded-[16px]" />
              <Skeleton className="h-24 rounded-[16px]" />
              <Skeleton className="h-24 rounded-[16px]" />
              <Skeleton className="h-24 rounded-[16px]" />
            </div>
          </div>
          <Skeleton className="min-h-[260px] rounded-[24px]" />
        </div>
      </SurfaceCard>

      <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="min-h-[520px] rounded-[24px]" />
        <Skeleton className="min-h-[720px] rounded-[24px]" />
      </div>
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
  onUpdateInvoice,
  onReviewInvoice,
}: {
  data: AdminInvoiceSnapshot | null
  system: AdminSystemSnapshot | null
  isLoading: boolean
  invoiceError: string | null
  activeInvoiceId: string | null
  onCreateInvoice: (payload: CreateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>
  onUpdateInvoice: (
    invoiceId: string,
    payload: UpdateAdminInvoiceInput,
  ) => Promise<AdminInvoiceSnapshot>
  onReviewInvoice: (
    invoiceId: string,
    payload: ReviewAdminInvoiceInput,
  ) => Promise<AdminInvoiceReviewResponse>
}) {
  const [invoices, setInvoices] = useState<InvoiceDraft[]>([])
  const [draft, setDraft] = useState<InvoiceDraft>(() => getNewBlankInvoice([]))
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [mode, setMode] = useState<"edit" | "new">("new")
  const [filter, setFilter] = useState<InvoiceFilter>("all")
  const [isSaving, setIsSaving] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<AdminInvoiceAiReview | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (!feedback) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null)
    }, 2800)

    return () => window.clearTimeout(timeout)
  }, [feedback])

  const applySnapshot = React.useCallback(
    (snapshot: AdminInvoiceSnapshot, preferredInvoiceId?: string) => {
      const mapped = snapshot.invoices.map(mapAdminInvoiceToDraft)
      setInvoices(mapped)

      if (!mapped.length) {
        const blank = getNewBlankInvoice(mapped)
        setDraft(blank)
        setSelectedInvoiceId(blank.id)
        setMode("new")
        setReviewResult(null)
        return
      }

      const nextSelectedId =
        preferredInvoiceId && mapped.some((invoice) => invoice.id === preferredInvoiceId)
          ? preferredInvoiceId
          : mapped[0].id
      const selected = mapped.find((invoice) => invoice.id === nextSelectedId) || mapped[0]

      setSelectedInvoiceId(selected.id)
      setDraft(cloneInvoice(selected))
      setMode("edit")
      setReviewResult(selected.aiReview || null)
    },
    [],
  )

  useEffect(() => {
    if (!data || isDirty) {
      return
    }
    applySnapshot(data, selectedInvoiceId || undefined)
  }, [applySnapshot, data, isDirty, selectedInvoiceId])

  if (isLoading && !data) {
    return <InvoiceWorkspaceSkeleton />
  }

  const statusCounts = getInvoiceCounts(invoices)
  const currentTotals = getInvoiceTotals(draft)
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) || null
  const filteredInvoices =
    filter === "all" ? invoices : invoices.filter((invoice) => invoice.status === filter)
  const outstandingInvoices = invoices.filter((invoice) => invoice.status !== "paid")
  const outstandingValue = outstandingInvoices.reduce(
    (sum, invoice) => sum + getInvoiceTotals(invoice).total,
    0,
  )
  const paidValue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + getInvoiceTotals(invoice).total, 0)
  const isMutating = isSaving || isReviewing || Boolean(activeInvoiceId)

  const updateDraft = (patch: Partial<InvoiceDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setIsDirty(true)
  }

  const updateLineItem = (itemId: string, patch: Partial<InvoiceLineItem>) => {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }))
    setIsDirty(true)
  }

  const addLineItem = () => {
    setDraft((current) => ({
      ...current,
      lineItems: [
        ...current.lineItems,
        buildLineItem({
          description: "New line item",
          quantity: 1,
          rate: 0,
          discountPercent: 0,
        }),
      ],
    }))
    setIsDirty(true)
  }

  const removeLineItem = (itemId: string) => {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.filter((item) => item.id !== itemId),
    }))
    setIsDirty(true)
  }

  const selectInvoice = (invoice: InvoiceDraft) => {
    if (isMutating) {
      return
    }

    setSelectedInvoiceId(invoice.id)
    setDraft(cloneInvoice(invoice))
    setMode("edit")
    setIsDirty(false)
    setReviewResult(invoice.aiReview || null)
    setFeedback(`Opened ${invoice.number}`)
  }

  const startNewInvoice = () => {
    if (isMutating) {
      return
    }

    const nextDraft = getNewBlankInvoice([...invoices, draft])
    setDraft(nextDraft)
    setSelectedInvoiceId(nextDraft.id)
    setMode("new")
    setIsDirty(true)
    setReviewResult(null)
    setFeedback("New draft ready")
  }

  const saveDraft = async () => {
    if (isMutating) {
      return
    }

    setIsSaving(true)
    try {
      const payload = mapDraftToInvoicePayload(draft)
      const snapshot =
        mode === "new"
          ? await onCreateInvoice(payload)
          : await onUpdateInvoice(draft.id, payload)
      const preferredId = mode === "new" ? snapshot.invoices[0]?.id : draft.id
      applySnapshot(snapshot, preferredId)
      setIsDirty(false)
      setFeedback(mode === "new" ? `Created ${draft.number}` : `Saved ${draft.number}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save invoice changes"
      setFeedback(message)
    } finally {
      setIsSaving(false)
    }
  }

  const runInvoiceReview = async (apply: boolean) => {
    if (isMutating) {
      return
    }

    if (!draft.id || mode === "new") {
      setFeedback("Save invoice first, then run AI review.")
      return
    }

    setIsReviewing(true)
    try {
      const result = await onReviewInvoice(draft.id, {
        tone: "professional",
        apply,
        instruction:
          "Check payment clarity, terms completeness, and line-item readability.",
      })
      setReviewResult(result.review)
      applySnapshot(result.snapshot, draft.id)
      setIsDirty(false)
      setFeedback(apply ? "AI suggestions applied." : "AI review completed.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to run AI review"
      setFeedback(message)
    } finally {
      setIsReviewing(false)
    }
  }

  const reorderLineItems = (event: DragEndEvent) => {
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

  const editorSourceLabel = mode === "new" ? "New draft" : selectedInvoice?.number || draft.number
  const paperIsDark = draft.displayVariant === "dark"
  const invoiceLogoSrc = draft.logoUrl || "/logo.svg"
  const partnerLogoSrc = draft.partnerLogoUrl || ""
  const surfaceInputClassName =
    "h-8 border-white/10 bg-white/4 text-sm text-white placeholder:text-white/28 focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"

  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sq-brand-action">
              <ReceiptSquare variant="Bulk" size={14} color="currentColor" />
              Invoice builder
            </span>
            <InvoiceBadge status={draft.status} />
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/12 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/48">
              <Edit2 variant="Bulk" size={13} color="currentColor" />
              {editorSourceLabel}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
              {isDirty ? "Unsaved changes" : "Saved state"}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
              {system?.core.ok ? system.core.service || "Core online" : "Core syncing"}
            </span>
            {feedback ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-100">
                <TickCircle variant="Bulk" size={14} color="currentColor" />
                {feedback}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startNewInvoice}
              disabled={isMutating}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Add variant="Bulk" size={14} color="currentColor" />
              New
            </button>
            <button
              type="button"
              onClick={() => void runInvoiceReview(false)}
              disabled={isSaving || isReviewing || mode === "new"}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DocumentText1 variant="Bulk" size={14} color="currentColor" />
              AI review
            </button>
            <button
              type="button"
              onClick={() => void runInvoiceReview(true)}
              disabled={isSaving || isReviewing || mode === "new"}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TickCircle variant="Bulk" size={14} color="currentColor" />
              Apply AI
            </button>
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={isSaving || isReviewing || !isDirty}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] px-3 py-1.5 text-xs font-medium text-[var(--sq-brand-action)] transition-colors hover:bg-[rgba(205,255,4,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--sq-brand-action)]" />
                  Saving
                </>
              ) : (
                <>
                  <TickCircle variant="Bulk" size={14} color="currentColor" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_470px]">
        <div className="space-y-3">
          <SurfaceCard eyebrow="Queue" title="Invoices">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {invoiceFilters.map((status) => {
                  const selected = filter === status
                  const count =
                    status === "all"
                      ? invoices.length
                      : statusCounts[status as InvoiceStatus]
                  const filterLabel = status === "all" ? "All invoices" : statusMeta[status].label

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilter(status)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                        selected
                          ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]"
                          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/18 hover:text-white/82",
                      )}
                    >
                      <span>{filterLabel}</span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px]">
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Live totals</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatMoney(outstandingValue, draft.currency)} outstanding
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-[16px] border border-dashed border-white/12 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Filtered rail</p>
                  <p className="mt-1 text-sm text-white/60">
                    {filter === "all"
                      ? "Showing the full invoice queue."
                      : `Showing ${statusMeta[filter].label.toLowerCase()} invoices only.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNewInvoice}
                  disabled={isMutating}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Add variant="Bulk" size={14} color="currentColor" />
                  Create
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {mode === "new" ? (
                <div className="rounded-[18px] border border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.08)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--sq-brand-action)]/80">
                        Working draft
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{draft.number}</p>
                      <p className="mt-1 text-[12px] text-white/60">
                        This draft is editable but not yet in the saved queue.
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(205,255,4,0.22)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--sq-brand-action)]">
                      Unsaved
                    </span>
                  </div>
                </div>
              ) : null}

              {filteredInvoices.length ? (
                filteredInvoices.map((invoice) => {
                  const amount = getInvoiceTotals(invoice).total
                  const selected = selectedInvoiceId === invoice.id && mode === "edit"

                  return (
                    <button
                      key={invoice.id}
                      type="button"
                      disabled={isMutating}
                      onClick={() => selectInvoice(invoice)}
                      className={cn(
                        "w-full rounded-[18px] border p-3 text-left transition-all",
                        selected
                          ? "border-[rgba(205,255,4,0.22)] bg-[linear-gradient(180deg,rgba(205,255,4,0.1),rgba(255,255,255,0.03))]"
                          : "border-white/10 bg-black/20 hover:border-white/18 hover:bg-white/4",
                        isMutating && "cursor-not-allowed opacity-70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">{invoice.number}</p>
                            <InvoiceBadge status={invoice.status} />
                          </div>
                          <p className="mt-1 text-[13px] text-white/60">
                            {invoice.clientCompany}
                            <span className="text-white/30"> · </span>
                            {invoice.clientName}
                          </p>
                          {invoice.partnerEnabled && invoice.partnerCompany ? (
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/36">
                              Partner · {invoice.partnerCompany}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {formatMoney(amount, invoice.currency)}
                          </p>
                          <p className="mt-1 text-[11px] text-white/45">
                            Due {formatDateLabel(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-[18px] border border-dashed border-white/12 bg-black/18 p-4">
                  <p className="text-sm font-semibold text-white">No invoices match this filter.</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    Switch to another status view or create a new draft from this rail.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFilter("all")}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/65 hover:border-white/20 hover:text-white"
                    >
                      Clear filters
                    </button>
                    <button
                      type="button"
                      onClick={startNewInvoice}
                      className="rounded-full border border-[rgba(205,255,4,0.22)] px-3 py-1.5 text-xs text-[var(--sq-brand-action)]"
                    >
                      Create draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Editor" title="Invoice details">
            <div className="grid gap-3">
              <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Profile2User variant="Bulk" size={18} color="currentColor" />
                    Brand and parties
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateDraft({ logoUrl: "/logo.svg" })}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/65 transition-colors hover:border-white/18 hover:text-white"
                    >
                      Use Square logo
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(
                          draft.partnerEnabled
                            ? {
                                partnerEnabled: false,
                                partnerLabel: "Delivery partner",
                                partnerName: "",
                                partnerCompany: "",
                                partnerEmail: "",
                                partnerLogoUrl: "",
                              }
                            : { partnerEnabled: true },
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        draft.partnerEnabled
                          ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]"
                          : "border-white/12 text-white/65 hover:border-white/18 hover:text-white",
                      )}
                    >
                      {draft.partnerEnabled ? "Remove partner" : "Add partner"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_132px]">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <InvoiceField label="Issuer name">
                      <Input
                        value={draft.issuerName}
                        onChange={(event) => updateDraft({ issuerName: event.target.value })}
                        disabled={isMutating}
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Issuer email">
                      <Input
                        value={draft.issuerEmail}
                        onChange={(event) => updateDraft({ issuerEmail: event.target.value })}
                        disabled={isMutating}
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Logo path or URL">
                      <Input
                        value={draft.logoUrl}
                        onChange={(event) => updateDraft({ logoUrl: event.target.value || "/logo.svg" })}
                        disabled={isMutating}
                        placeholder="/logo.svg"
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Client name">
                      <Input
                        value={draft.clientName}
                        onChange={(event) => updateDraft({ clientName: event.target.value })}
                        disabled={isMutating}
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Client company">
                      <Input
                        value={draft.clientCompany}
                        onChange={(event) => updateDraft({ clientCompany: event.target.value })}
                        disabled={isMutating}
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Client email">
                      <Input
                        value={draft.clientEmail}
                        onChange={(event) => updateDraft({ clientEmail: event.target.value })}
                        disabled={isMutating}
                        className={surfaceInputClassName}
                      />
                    </InvoiceField>
                    <InvoiceField label="Paper style">
                      <select
                        value={draft.displayVariant}
                        onChange={(event) =>
                          updateDraft({ displayVariant: event.target.value as InvoiceDisplayVariant })
                        }
                        disabled={isMutating}
                        className="h-8 w-full rounded-md border border-white/10 bg-white/4 px-3 text-sm text-white outline-none transition-colors focus:border-[rgba(205,255,4,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {invoiceDisplayVariants.map((variant) => (
                          <option key={variant} value={variant} className="bg-slate-950 text-white">
                            {variant === "light" ? "White paper" : "Black paper"}
                          </option>
                        ))}
                      </select>
                    </InvoiceField>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Logo preview</p>
                    <div
                      className={cn(
                        "mt-3 flex h-[76px] items-center justify-center rounded-[14px] border border-white/10",
                        paperIsDark ? "bg-slate-950" : "bg-white",
                      )}
                    >
                      <img
                        src={invoiceLogoSrc}
                        alt="Invoice logo"
                        className={cn(
                          "h-7 w-auto max-w-[94px] object-contain",
                          paperIsDark ? "brightness-0 invert" : "brightness-0",
                        )}
                      />
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-white/45">
                      Default Square branding is loaded automatically. Replace it with a custom
                      path or URL when this invoice needs a different mark.
                    </p>
                  </div>
                </div>

                {draft.partnerEnabled ? (
                  <div className="mt-3 rounded-[16px] border border-dashed border-white/12 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Profile2User variant="Bulk" size={16} color="currentColor" />
                      Partner company
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <InvoiceField label="Partner label">
                        <Input
                          value={draft.partnerLabel}
                          onChange={(event) => updateDraft({ partnerLabel: event.target.value })}
                          disabled={isMutating}
                          placeholder="Delivery partner"
                          className={surfaceInputClassName}
                        />
                      </InvoiceField>
                      <InvoiceField label="Partner company">
                        <Input
                          value={draft.partnerCompany}
                          onChange={(event) => updateDraft({ partnerCompany: event.target.value })}
                          disabled={isMutating}
                          className={surfaceInputClassName}
                        />
                      </InvoiceField>
                      <InvoiceField label="Partner contact">
                        <Input
                          value={draft.partnerName}
                          onChange={(event) => updateDraft({ partnerName: event.target.value })}
                          disabled={isMutating}
                          className={surfaceInputClassName}
                        />
                      </InvoiceField>
                      <InvoiceField label="Partner email">
                        <Input
                          value={draft.partnerEmail}
                          onChange={(event) => updateDraft({ partnerEmail: event.target.value })}
                          disabled={isMutating}
                          className={surfaceInputClassName}
                        />
                      </InvoiceField>
                      <InvoiceField label="Partner logo">
                        <Input
                          value={draft.partnerLogoUrl}
                          onChange={(event) => updateDraft({ partnerLogoUrl: event.target.value })}
                          disabled={isMutating}
                          placeholder="https://partner.com/logo.svg"
                          className={surfaceInputClassName}
                        />
                      </InvoiceField>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Calendar variant="Bulk" size={18} color="currentColor" />
                  Billing setup
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <InvoiceField label="Invoice number">
                    <Input
                      value={draft.number}
                      onChange={(event) => updateDraft({ number: event.target.value })}
                      disabled={isMutating}
                      className={surfaceInputClassName}
                    />
                  </InvoiceField>
                  <InvoiceField label="Status">
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft({ status: event.target.value as InvoiceStatus })}
                      disabled={isMutating}
                      className="h-8 w-full rounded-md border border-white/10 bg-white/4 px-3 text-sm text-white outline-none transition-colors focus:border-[rgba(205,255,4,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status} value={status} className="bg-slate-950 text-white">
                          {statusMeta[status].label}
                        </option>
                      ))}
                    </select>
                  </InvoiceField>
                  <InvoiceField label="Issue date">
                    <Input
                      type="date"
                      value={draft.issueDate}
                      onChange={(event) => updateDraft({ issueDate: event.target.value })}
                      disabled={isMutating}
                      className={surfaceInputClassName}
                    />
                  </InvoiceField>
                  <InvoiceField label="Due date">
                    <Input
                      type="date"
                      value={draft.dueDate}
                      onChange={(event) => updateDraft({ dueDate: event.target.value })}
                      disabled={isMutating}
                      className={surfaceInputClassName}
                    />
                  </InvoiceField>
                  <InvoiceField label="Currency">
                    <select
                      value={draft.currency}
                      onChange={(event) => updateDraft({ currency: event.target.value })}
                      disabled={isMutating}
                      className="h-8 w-full rounded-md border border-white/10 bg-white/4 px-3 text-sm text-white outline-none transition-colors focus:border-[rgba(205,255,4,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency} className="bg-slate-950 text-white">
                          {currency}
                        </option>
                      ))}
                    </select>
                  </InvoiceField>
                  <InvoiceField label="Tax rate" hint="%">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={draft.taxRate}
                      onChange={(event) => updateDraft({ taxRate: parseNumberInput(event.target.value, 0) })}
                      disabled={isMutating}
                      className={surfaceInputClassName}
                    />
                  </InvoiceField>
                  <InvoiceField label="Payment terms">
                    <Input
                      value={draft.paymentTerms}
                      onChange={(event) => updateDraft({ paymentTerms: event.target.value })}
                      disabled={isMutating}
                      className={surfaceInputClassName}
                    />
                  </InvoiceField>
                </div>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Sort variant="Bulk" size={18} color="currentColor" />
                    Line items
                  </div>
                  <button
                    type="button"
                    onClick={addLineItem}
                    disabled={isMutating}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Add variant="Bulk" size={14} color="currentColor" />
                    Add item
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {draft.lineItems.length ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={reorderLineItems}
                    >
                      <SortableContext
                        items={draft.lineItems.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {draft.lineItems.map((item) => (
                            <SortableLineItemRow
                              key={item.id}
                              item={item}
                              currency={draft.currency}
                              disabled={isMutating}
                              onChange={updateLineItem}
                              onRemove={removeLineItem}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-white/12 bg-black/18 p-4">
                      <p className="text-sm font-semibold text-white">No line items yet.</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                        Add a service or product line, then drag items into the right order for the
                        preview sheet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {invoiceError ? (
                <div className="rounded-[18px] border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3.5 py-2.5 text-sm text-[#ffb49d]">
                  {invoiceError}
                </div>
              ) : null}

              {reviewResult ? (
                <div className="rounded-[18px] border border-dashed border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.07)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sq-brand-action)]/75">
                        AI review
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {reviewResult.summary}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                      {new Date(reviewResult.reviewedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[14px] border border-white/10 bg-black/20 p-3 text-sm text-white/65">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Suggestions
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {reviewResult.suggestions.slice(0, 3).map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[14px] border border-white/10 bg-black/20 p-3 text-sm text-white/65">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Risk flags
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {reviewResult.riskFlags.length ? (
                          reviewResult.riskFlags.slice(0, 3).map((flag) => (
                            <p key={flag}>{flag}</p>
                          ))
                        ) : (
                          <p>No blocking risk detected.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <DocumentText1 variant="Bulk" size={18} color="currentColor" />
                    Client notes
                  </div>
                  <Textarea
                    value={draft.notes}
                    onChange={(event) => updateDraft({ notes: event.target.value })}
                    disabled={isMutating}
                    className="mt-3 min-h-[104px] border-white/10 bg-white/4 text-white placeholder:text-white/30 focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
                  />
                </div>
                <div className="rounded-[18px] border border-dashed border-white/12 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <More variant="Bulk" size={18} color="currentColor" />
                    Internal memo
                  </div>
                  <Textarea
                    value={draft.memo}
                    onChange={(event) => updateDraft({ memo: event.target.value })}
                    disabled={isMutating}
                    className="mt-3 min-h-[104px] border-white/10 bg-white/4 text-white placeholder:text-white/30 focus-visible:border-[rgba(205,255,4,0.28)] focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          eyebrow="Preview"
          title="Sticky A4 preview"
          className="xl:sticky xl:top-3 xl:self-start xl:h-[calc(100vh-1.5rem)]"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-black/20 px-3 py-2.5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Sheet mode</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {paperIsDark ? "Black edition" : "White edition"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/38">Paper</p>
                <p className="mt-1 text-sm font-semibold text-white">A4 portrait</p>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-[20px] border border-white/10 bg-black/20 p-3">
              <div className="mx-auto w-full max-w-[380px]">
                <div
                  className={cn(
                    "min-h-[540px] rounded-[28px] border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] xl:aspect-[210/297] xl:p-5",
                    paperIsDark
                      ? "border-slate-800 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950",
                  )}
                >
                  <div className="flex h-full flex-col">
                    <div
                      className={cn(
                        "flex items-start justify-between gap-3 border-b pb-4",
                        paperIsDark ? "border-white/10" : "border-slate-200",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-12 min-w-0 items-center rounded-[16px] border px-3",
                              paperIsDark ? "border-white/10 bg-white/4" : "border-slate-200 bg-slate-50",
                            )}
                          >
                            <img
                              src={invoiceLogoSrc}
                              alt={draft.issuerName}
                              className={cn(
                                "h-5 w-auto max-w-[110px] object-contain",
                                paperIsDark ? "brightness-0 invert" : "brightness-0",
                              )}
                            />
                          </div>
                          {draft.partnerEnabled && draft.partnerCompany ? (
                            <div
                              className={cn(
                                "flex h-12 min-w-0 items-center rounded-[16px] border px-3",
                                paperIsDark ? "border-white/10 bg-white/4" : "border-slate-200 bg-slate-50",
                              )}
                            >
                              {partnerLogoSrc ? (
                                <img
                                  src={partnerLogoSrc}
                                  alt={draft.partnerCompany}
                                  className={cn(
                                    "h-5 w-auto max-w-[98px] object-contain",
                                    paperIsDark ? "brightness-0 invert" : "brightness-0",
                                  )}
                                />
                              ) : (
                                <span className={cn("text-[10px] uppercase tracking-[0.18em]", paperIsDark ? "text-white/70" : "text-slate-500")}>
                                  {draft.partnerLabel}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <p className={cn("mt-3 text-[10px] uppercase tracking-[0.24em]", paperIsDark ? "text-white/45" : "text-slate-400")}>
                          Invoice
                        </p>
                        <h3 className={cn("mt-1 text-2xl font-semibold tracking-[-0.04em]", paperIsDark ? "text-white" : "text-slate-950")}>
                          {draft.number}
                        </h3>
                      </div>

                      <div className="text-right">
                        <InvoiceBadge status={draft.status} inverse={!paperIsDark} />
                        <p className={cn("mt-2 text-sm font-medium", paperIsDark ? "text-white/85" : "text-slate-700")}>
                          {formatDateLabel(draft.issueDate)}
                        </p>
                        <p className={cn("text-sm", paperIsDark ? "text-white/55" : "text-slate-500")}>
                          Due {formatDateLabel(draft.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className={cn("text-[10px] uppercase tracking-[0.22em]", paperIsDark ? "text-white/42" : "text-slate-400")}>
                          From
                        </p>
                        <p className={cn("mt-1 text-base font-semibold", paperIsDark ? "text-white" : "text-slate-950")}>
                          {draft.issuerName}
                        </p>
                        <p className={cn("mt-1 text-sm", paperIsDark ? "text-white/60" : "text-slate-600")}>
                          {draft.issuerEmail}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-[10px] uppercase tracking-[0.22em]", paperIsDark ? "text-white/42" : "text-slate-400")}>
                          Bill to
                        </p>
                        <p className={cn("mt-1 text-base font-semibold", paperIsDark ? "text-white" : "text-slate-950")}>
                          {draft.clientCompany}
                        </p>
                        <p className={cn("mt-1 text-sm", paperIsDark ? "text-white/60" : "text-slate-600")}>
                          {draft.clientName}
                        </p>
                        <p className={cn("mt-1 text-sm", paperIsDark ? "text-white/45" : "text-slate-500")}>
                          {draft.clientEmail}
                        </p>
                      </div>
                      {draft.partnerEnabled && draft.partnerCompany ? (
                        <div className="sm:col-span-2 rounded-[18px] border border-dashed p-3">
                          <p className={cn("text-[10px] uppercase tracking-[0.22em]", paperIsDark ? "text-white/42" : "text-slate-400")}>
                            {draft.partnerLabel || "Partner company"}
                          </p>
                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                              <p className={cn("text-sm font-semibold", paperIsDark ? "text-white" : "text-slate-950")}>
                                {draft.partnerCompany}
                              </p>
                              {draft.partnerName ? (
                                <p className={cn("mt-1 text-sm", paperIsDark ? "text-white/60" : "text-slate-600")}>
                                  {draft.partnerName}
                                </p>
                              ) : null}
                              {draft.partnerEmail ? (
                                <p className={cn("mt-1 text-sm", paperIsDark ? "text-white/45" : "text-slate-500")}>
                                  {draft.partnerEmail}
                                </p>
                              ) : null}
                            </div>
                            {partnerLogoSrc ? (
                              <img
                                src={partnerLogoSrc}
                                alt={draft.partnerCompany}
                                className={cn(
                                  "h-7 w-auto max-w-[88px] object-contain",
                                  paperIsDark ? "brightness-0 invert" : "brightness-0",
                                )}
                              />
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className={cn("mt-4 overflow-hidden rounded-[20px] border", paperIsDark ? "border-white/10" : "border-slate-200")}>
                      <table className="w-full border-collapse text-left">
                        <thead className={paperIsDark ? "bg-white/4" : "bg-slate-50"}>
                          <tr className={cn("text-[10px] uppercase tracking-[0.2em]", paperIsDark ? "text-white/50" : "text-slate-500")}>
                            <th className="px-3 py-2 font-medium">Item</th>
                            <th className="px-3 py-2 font-medium">Qty</th>
                            <th className="px-3 py-2 font-medium">Rate</th>
                            <th className="px-3 py-2 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.lineItems.map((item) => (
                            <tr
                              key={item.id}
                              className={cn("align-top border-t", paperIsDark ? "border-white/10" : "border-slate-200")}
                            >
                              <td className="px-3 py-2.5">
                                <p className={cn("text-[13px] font-medium", paperIsDark ? "text-white" : "text-slate-950")}>
                                  {item.description}
                                </p>
                                {item.discountPercent > 0 ? (
                                  <p className={cn("mt-1 text-[11px]", paperIsDark ? "text-white/42" : "text-slate-500")}>
                                    Line discount {item.discountPercent.toFixed(0)}%
                                  </p>
                                ) : null}
                              </td>
                              <td className={cn("px-3 py-2.5 text-[13px]", paperIsDark ? "text-white/70" : "text-slate-600")}>
                                {item.quantity}
                              </td>
                              <td className={cn("px-3 py-2.5 text-[13px]", paperIsDark ? "text-white/70" : "text-slate-600")}>
                                {formatMoney(item.rate, draft.currency)}
                              </td>
                              <td className={cn("px-3 py-2.5 text-right text-[13px] font-medium", paperIsDark ? "text-white" : "text-slate-950")}>
                                {formatMoney(getInvoiceLineAmount(item), draft.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px]">
                      <div className="space-y-3">
                        <div>
                          <p className={cn("text-[10px] uppercase tracking-[0.22em]", paperIsDark ? "text-white/42" : "text-slate-400")}>
                            Notes
                          </p>
                          <div
                            className={cn(
                              "mt-2 rounded-[18px] border p-3 text-[13px] leading-relaxed",
                              paperIsDark
                                ? "border-white/10 bg-white/[0.03] text-white/68"
                                : "border-slate-200 bg-slate-50 text-slate-700",
                            )}
                          >
                            {draft.notes || "No client note added yet."}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "rounded-[18px] border p-3 text-[12px]",
                            paperIsDark
                              ? "border-white/10 bg-white/[0.03] text-white/55"
                              : "border-slate-200 bg-slate-50 text-slate-600",
                          )}
                        >
                          {draft.paymentTerms} · Tax {draft.taxRate.toFixed(1)}% · {draft.currency}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-[20px] border p-3",
                          paperIsDark
                            ? "border-white/10 bg-white/4"
                            : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="space-y-2 text-[13px]">
                          <div className={cn("flex items-center justify-between gap-3", paperIsDark ? "text-white/60" : "text-slate-600")}>
                            <span>Subtotal</span>
                            <span className={paperIsDark ? "text-white" : "text-slate-950"}>
                              {formatMoney(currentTotals.subtotal, draft.currency)}
                            </span>
                          </div>
                          <div className={cn("flex items-center justify-between gap-3", paperIsDark ? "text-white/60" : "text-slate-600")}>
                            <span>Discount</span>
                            <span className={paperIsDark ? "text-white" : "text-slate-950"}>
                              -{formatMoney(currentTotals.discount, draft.currency)}
                            </span>
                          </div>
                          <div className={cn("flex items-center justify-between gap-3", paperIsDark ? "text-white/60" : "text-slate-600")}>
                            <span>Tax</span>
                            <span className={paperIsDark ? "text-white" : "text-slate-950"}>
                              {formatMoney(currentTotals.tax, draft.currency)}
                            </span>
                          </div>
                        </div>
                        <div className={cn("mt-4 border-t pt-4", paperIsDark ? "border-white/10" : "border-slate-200")}>
                          <p className={cn("text-[10px] uppercase tracking-[0.18em]", paperIsDark ? "text-white/45" : "text-slate-500")}>
                            Total
                          </p>
                          <p className={cn("mt-1 text-2xl font-semibold tracking-[-0.04em]", paperIsDark ? "text-white" : "text-slate-950")}>
                            {formatMoney(currentTotals.total, draft.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
