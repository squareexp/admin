import { AdminSection } from "@/lib/admin-types";

export const SECTION_META: Record<
  AdminSection,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  dashboard: {
    eyebrow: "Control center",
    title: "Dashboard",
    description:
      "Statistics across all workspaces",
  },
  messages: {
    eyebrow: "Communications",
    title: "Messages",
    description:
      "Internal team chat, support inbox for global clients, and the private inbox lane for one-on-one collaboration.",
  },
  invoice: {
    eyebrow: "Commercial ops",
    title: "Invoice",
    description:
      "Build the invoice engine foundation for new invoices, filters, proforma flow, and future AI-assisted review.",
  },
  mail: {
    eyebrow: "Outbound",
    title: "Mail Desk",
    description:
      "Compose and dispatch invoice emails with custom subjects and contextual notes through backend delivery.",
  },
  report: {
    eyebrow: "Client quality",
    title: "Report",
    description:
      "Track issue reports, client product problems, and operational follow-up from the report pipeline.",
  },
  team: {
    eyebrow: "Administration",
    title: "Team Management",
    description:
      "Manage roles, assignments, progress prompts, suspension controls, and operational team visibility.",
  },
  analytics: {
    eyebrow: "Performance",
    title: "Analytics",
    description:
      "Go deeper into visitors, bookings, support pressure, and backend health while preparing room for revenue analytics.",
  },
  tasks: {
    eyebrow: "Execution",
    title: "Tasks",
    description:
      "Shape a real-time task system that turns operational signals into collaborative work with progress tracking.",
  },
  billings: {
    eyebrow: "Finance desk",
    title: "Billings",
    description:
      "Reserved billing workspace for super admin finance operations, renewal follow-ups, and paid ledger review.",
  },
  settings: {
    eyebrow: "Configuration",
    title: "Settings",
    description:
      "",
  },
};
