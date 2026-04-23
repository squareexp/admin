/**
 * Re-exports all workspace components from the modular `workspaces/` directory.
 *
 * This file exists solely to preserve backward-compatible import paths.
 * New code should import directly from `./workspaces` instead.
 */
export {
  DashboardWorkspace,
  MessageInboxWorkspace,
  InvoiceWorkspace,
  ReportWorkspace,
  TeamWorkspace,
  AnalyticsWorkspace,
  TasksWorkspace,
  BillingsWorkspace,
  SettingsWorkspace,
} from "./workspaces";
