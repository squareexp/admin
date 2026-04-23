import { 
  Home2, 
  MessageQuestion, 
  TaskSquare, 
  Setting2, 
  WalletMoney, 
  Receipt21, 
  Category2, 
  Monitor, 
  DirectInbox 
} from "iconsax-react";

export const sectionMeta = {
  overview: {
    label: "Overview",
    icon: Home2,
    description: "System health and team performance.",
  },
  support: {
    label: "Support Desk",
    icon: MessageQuestion,
    description: "Customer interactions and live assistance.",
  },
  tasks: {
    label: "Execution",
    icon: TaskSquare,
    description: "Internal tasks and project roadmap.",
  },
  inbox: {
    label: "Team Inbox",
    icon: DirectInbox,
    description: "Private team threads and private messages.",
  },
  billings: {
    label: "Accounting",
    icon: WalletMoney,
    description: "Invoicing and subscription management.",
  },
  invoices: {
    label: "Invoice Hub",
    icon: Receipt21,
    description: "Detailed client billing and document center.",
  },
  settings: {
    label: "Management",
    icon: Setting2,
    description: "Application controls and mail profiles.",
  },
  system: {
    label: "Infrastructure",
    icon: Monitor,
    description: "Node, core, and database health monitors.",
  },
  logs: {
    label: "Telemetry",
    icon: Category2,
    description: "Real-time system logs and event stream.",
  },
} as const;

export type DashboardSection = keyof typeof sectionMeta;
