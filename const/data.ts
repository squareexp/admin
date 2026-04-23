import { MenuData } from "@/components/types/type";

export const menuData: MenuData = {
  for_business: [
    {
      title: "Operations & Logistics",
      items: [
        "Logistics & delivery",
        "Dispatch & tracking",
        "Internal business tools",
      ],
    },
    {
      title: "Sales & Commerce",
      items: [
        "Retail & e-commerce",
        "Orders & inventory",
        "Invoicing & receipts",
        "Payments integration",
      ],
    },
    {
      title: "Bookings & Events",
      items: [
        "Services & appointments",
        "Ticketing & events",
        "Membership & access control",
        "Travel & tourism booking",
      ],
    },
    {
      title: "Customer Support & CRM",
      items: [
        "CRM (leads & customers)",
        "Helpdesk / support tickets",
        "WhatsApp/SMS notifications",
        "Feedback & surveys",
      ],
    },
    {
      title: "Education & Training",
      items: [
        "School management",
        "Student/parent portals",
        "Training & certificates",
      ],
    },
    {
      title: "Admin & Reporting",
      items: [
        "Roles & permissions (RBAC)",
        "Branches & staff management",
        "Audit logs",
        "Reports & analytics",
      ],
    },
  ],

  products: [
    {
      title: "Square Platforms",
      items: [
        "Square for Business (Multi-tenant platform)",
        "Square for Community (Public programs)",
        "Square Admin (Roles, branches, reporting)",
      ],
    },
    {
      title: "Business Modules",
      items: [
        "Logistics Suite",
        "Ticketing & Check-in",
        "Bookings & Appointments",
        "CRM & Helpdesk",
        "Invoicing & Receipts",
      ],
    },
    {
      title: "In Progress",
      items: [
        "Payments Hub (Mobile Money + Bank)",
        "WhatsApp Automation",
        "Analytics Dashboard",
      ],
    },
  ],

  partnership: [
    {
      title: "Partner With Us",
      items: [
        "Contract development",
        "Solution partners",
        "Referral partners",
        "Technology partners",
      ],
    },
    {
      title: "For Partners",
      items: [
        "Partner resources",
        "Training & onboarding",
        "Success stories",
        "Partner support",
      ],
    },
  ],

  services: [
    {
      title: "Build & Customize",
      items: [
        "Custom business systems",
        "UI/UX & product design",
        "Web & app development",
        "Backend APIs & integrations",
        "MVP development",
      ],
    },
    {
      title: "Automation",
      items: [
        "n8n automation services",
        "Workflow automation",
        "Integrations (payments, SMS, WhatsApp, email)",
      ],
    },
    {
      title: "Support & Training",
      items: [
        "Technical support",
        "Maintenance & support",
        "Computer training",
      ],
    },
    {
      title: "Launch & Reliability",
      items: [
        "Cloud deployment",
        "DevOps & CI/CD",
        "Monitoring & backups",
        "Security & quality (RBAC, audit logs, testing)",
      ],
    },
  ],
};

export const LOGO_BASE64 =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5Mi41NiAxNi4wNCI+CiAgPGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj4KICAgIDxwYXRoIGQ9Ik0yNy43MSwxMi44OGMtLjEyLS4xMi0uMjEtLjE5LS4yOS0uMjctLjUzLS41OS0xLjA1LTEuMTgtMS41OS0xLjc2LS4yLS4yMi0uMjEtLjQxLS4wOC0uNjUuMjItLjQyLjM1LS44OC40NC0xLjM0LjExLS42Mi4xMS0xLjIzLS4wMi0xLjg0LS40MS0xLjkxLTIuMDEtMy40Ny0zLjktMy44MS0yLjI5LS40MS00Ljg0Ljg3LTUuNTcsMy41Ny0uNjksMi41NS43NCw1LjQsMy44Myw2LjA1LjczLjE1LDEuNDYuMSwyLjE3LS4wOS4wNi0uMDEuMTEtLjAzLjE2LS4wNS4yMi0uMDkuMzktLjAzLjUzLjE2LjA5LjExLjE5LjIxLjI5LjMyLjQzLjQ4Ljg3Ljk2LDEuMjksMS40NC4xLjEyLjIzLjIyLjI2LjM3LS4wMy4xNS0uMTUuMTktLjI1LjI0LS43Mi4zNC0xLjQ2LjYxLTIuMjQuNzItMi41LjM3LTQuNzItLjI2LTYuNjUtMS44OS0xLjM2LTEuMTUtMi4yMy0yLjYzLTIuNTUtNC4zOC0uODQtNC41NiwxLjk2LTguMjYsNS41Ny05LjM0LDEuMTItLjM0LDIuMjUtLjM4LDMuNDEtLjI0LDIuODUuMzUsNS40MiwyLjUxLDYuMzcsNS4wNS4zOSwxLjA1LjU5LDIuMTMuNTMsMy4yNS0uMDcsMS4zMS0uNDYsMi41My0xLjEyLDMuNjctLjEyLjIxLS4yNi40MS0uMzkuNjItLjA1LjA3LS4xMS4xMi0uMi4yMloiLz4KICAgIDxwYXRoIGQ9Ik03NC43MSw5LjQ3Yy4wOS4xNC4xNS4yNS4yMy4zNiwxLjMxLDEuODMsMi42MiwzLjY2LDMuOTMsNS41LjExLjE1LjI0LjI4LjI4LjUtLjA5LjAzLS4xNi4wOC0uMjQuMDgtMS4xMywwLTIuMjcsMC0zLjQsMC0uMjEsMC0uMzYtLjA3LS40Ny0uMjQtLjA3LS4xMS0uMTUtLjIxLS4yMi0uMzItMS4xNC0xLjY1LTIuMjgtMy4zMS0zLjQyLTQuOTYtLjExLS4xNS0uMjItLjMtLjM0LS40Ny0uNTcsMC0xLjE0LDAtMS43MywwLS4wMy4xMi0uMDcuMjEtLjA4LjMtLjAxLjE2LDAsLjMyLDAsLjQ3LDAsMS41NCwwLDMuMDcsMCw0LjYxLDAsLjE3LS4wMS4zNC0uMDIuNTMtLjEyLjAzLS4yMS4wNy0uMy4wNy0uNzYsMC0xLjUyLDAtMi4yOCwwLS4wNiwwLS4xMSwwLS4xNy0uMDItLjE3LS4wMy0uMjItLjA4LS4yNC0uMjUsMC0uMTEsMC0uMjMsMC0uMzQsMC0yLjY4LDAtNS4zNywwLTguMDUsMC0uNiwwLS42LjU5LS42LjU2LDAsMy4xMywwLDQuNjksMCwuMjcsMCwuNTUsMCwuODItLjAxLjM1LS4wMS42OS0uMDguOTktLjI1LjU5LS4zMi45Mi0uODIuOS0xLjUuMDItLjY4LS4zOC0xLjE1LTEtMS40My0uNDItLjE4LS44Ni0uMjItMS4zMS0uMjItLjksMC0xLjgxLDAtMi43MSwwLS4xNCwwLS4yOSwwLS40MywwLTEuMjItLjA0LTIuMTgtLjgyLTIuNDctMi4wMi0uMDYtLjAzLS4xMy0uMDYtLjI1LS4wOS0uMTktLjA2LS4zNy0uMTItLjU2LS4xOC0uNDItLjEzLS44NC0uMjctMS4yNy0uMzktLjQ2LS4xMy0uOTMtLjIzLTEuNDEtLjI5LS41OS0uMDctMS4xOC0uMDktMS43Ny0uMDUtMS4yOS4wOC0yLjUyLjQ5LTMuNjQsMS4xNi0uNjkuNDEtMS4zLjk0LTEuODIsMS41NnYtLjA2YzAtLjcxLDAtMS40MSwwLTIuMTIsMC0uMiwwLS40LDAtLjU5LDAtLjExLDAtLjIyLS4wMy0uMzItLjAzLS4xMS0uMDgtLjE5LS4xNi0uMjYtLjQxLS4zMy0uODctLjU4LTEuMzYtLjczLS4xNi0uMDUtLjMzLS4wOC0uNS0uMDktLjI4LDAtLjU0LjA1LS43OC4yMi0uMjQuMTYtLjM4LjM5LS40OC42NS0uMS4yNi0uMTMuNTQtLjEzLjgyLDAsMS45NiwwLDMuOTIsMCw1Ljg4LDAsLjE3LDAsLjM0LDAsLjUxLDAsLjExLDAsLjIyLjAzLjMzLjA1LjE5LjE3LjMzLjMyLjQ3LjQxLjM5LjkxLjY1LDEuNDMsLjc5LjE3LjA0LjMzLjA3LjUxLjA3LjIzLDAsLjQ1LS4wMy42Ni0uMTQuMjItLjExLjM4LS4yOC41LS40OC4xMy0uMjIuMTgtLjQ2LjE4LS43MSwwLS42NSwwLTEuMzEsMC0xLjk2LDAtLjI3LDAtLjUzLjAxLS44LjA0LS44Mi4xOC0xLjYzLjUzLTIuMzguMjUtLjUzLjU3LTEuMDEuOTYtMS40My4zNy0uMzkuNzktLjcxLDEuMjUtLjk4LDEuMDUtLjYyLDIuMjMtLjk0LDMuNDQtLjk1LDEuMTgtLjAxLDIuMzYuMjMsMy40NS43MiwuNDkuMjIsLjk2LjQ5LDEuMzkuODEuMjguMjEuNTMuNDYuNzUuNzMuMjEuMjUuMzkuNTMuNTUuODJ2LS4wNmMwLS44MSwwLTEuNjIsMC0yLjQzLDAsLjE2LDAsLjMyLDAsLjQ4LDAsLjE0LDAsLjI5LS4wMy40My0uMDQuMTctLjEzLjMyLS4yNS40NS0uNjIuNjgtMS4zOSwxLjAyLTIuMjIsMS4wMS0uMjIsMC0uNDMsMC0uNjUtLjAzLS4zMS0uMDQtLjU5LS4xNy0uODMtLjM5LS4yMS0uMTktLjMzLS40NC0uMzktLjcyLS4wNi0uMjktLjA2LS41OS0uMDQtLjg4LjA0LS41Mi4yMy0uOTguNTgtMS4zNC4zNS0uMzYuNzktLjYxLDEuMjctLjc0LjIyLS4wNi40NS0uMDguNjgtLjA4LDEuODEsMCwzLjYzLDAsNS40NCwwLC4xNywwLC4zNC4wMS41MS4wMy4xNS4xLjI3LjIxLjM3LjY1LjU3LDEuMzYuOTIsMi4xMywxLjA2LjE2LjAzLjMzLjA0LjQ5LjA0LjI2LDAsLjUxLS4wNS43NC0uMTguMjEtLjEyLjM4LS4zLjQ5LS41Mi4xMi0uMjMuMTgtLjQ4LjE4LS43NCwwLTEuODksMC0zLjc4LDAsNS42NywwLC4xOSwwLC4zNy0uMDQuNTYtLjAzLjE4LS4xLjM0LS4yMS40OC0uNDIuNTMtLjk1Ljg4LTEuNTMsMS4wMS0uMjIuMDUtLjQ1LjA3LS42Ny4wNi0uMjgsMC0uNTQtLjA1LS43OC0uMjEtLjIzLS4xNS0uNC0uMzUtLjUxLS42LS4xMS0uMjYtLjE1LS41NC0uMTQtLjgyLjAxLS4yOC4wMS0uNTYsMC0uODV2LS4xOWMtLjM1LjM5LS43NC43NS0xLjE3LDEuMDctLjkzLjY4LTIuMDIsMS4wOS0zLjE2LDEuMi0uNTQuMDUtMS4wOC4wNi0xLjYyLS4wMS0xLjI0LS4xNi0yLjM5LS42Ny0zLjM2LTEuNDYtLjg4LS43Mi0xLjU5LTEuNi0yLjA3LTIuNjItLjQ4LTEuMDItLjc2LTIuMTItLjgzLTMuMjQtLjA3LTEuMTIuMDMtMi4yNC4zMy0zLjMyLjIzLS44MS41OC0xLjU5LDEuMDMtMi4zMS40Ni0uNzMsMS4wMy0xLjM4LDEuNy0xLjk0LjcxLS41OSwxLjUxLTEuMDYsMi4zOC0xLjM5LDEuMDUtLjQsMi4xNS0uNTksMy4yNy0uNTcsMS4wOC4wMiwyLjE1LjIzLDMuMTYuNjMuODQuMzMsMS42MS44LDIuMjksMS40MS4yNy4yNC41MS41MS43NC43OVptLTUuMzksMTAuM2MuMDQsMCwuMDksMCwuMTMsMGl2LS4wM2MtLjE3LDAtLjMzLDAtLjUsMC0uMTQsMC0uMjgsMC0uNDMsMC0uNDksMC0uOTgsMC0xLjQ3LDAtLjE2LDAsLjMyLDAsLjQ4LDAtLjI0LDAtLjQ4LDAtLjcxLDAtMS4wNS4wMi0yLjEsLjIyLTMuMTMsMS4xMS0uNDMuMzctLjc4LjgzLTEuMDYsMS4zMy0uMjguNS0uNDcsMS4wNC0uNTgsMS42MS0uMTEuNTYtLjEzLDEuMTQtLjA2LDEuNy4wNy41Ny4yMywxLjEyLjQ3LDEuNjQuMjQuNTEuNTYuOTgsLjkzLDEuMzkuMzguNDIuODEuNzgsMS4yOSwxLjA1LjUuMjksMS4wNC40OSwxLjYuNTkuNTYuMTEsMS4xNC4xMywxLjcxLjA3LjY3LS4wNywxLjMzLS4yNCwxLjk1LS41MS42LS4yNiwxLjE1LS42MywxLjYxLTEuMDguNDYtLjQ1Ljg0LS45OCwxLjEzLTEuNTYuMy0uNTkuNS0xLjIxLjU4LTEuODYuMDktLjY2LjA1LTEuMzMtLjExLTEuOTgtLjE2LS42My0uNDItMS4yMy0uNzgtMS43OC0uMzctLjU1LS44My0xLjA0LTEuMzctMS40My0uNTQtLjM5LTEuMTQtLjY4LTEuNzgtLjg2LS42NC0uMTgtMS4zMS0uMjUtMS45Ny0uMjItLjY1LjAzLTEuMjkuMTctMS45LjQyLS42MS4yNS0xLjE3LjYtMS42NSwxLjAzLS40OC40My0uODgsLjkzLTEuMTgsMS40OS0uMy41Ni0uNSwxLjE2LS41OSwxLjc4LS4wOS42My0uMDcsMS4yNy4wNiwxLjg5LjEzLjYzLjM3LDEuMjMuNywxLjc5LjMzLjU1Ljc1LDEuMDUsMS4yMywxLjQ2LjQ5LjQxLDEuMDMuNzMsMS42Mi45NS41OS4yMiwxLjIyLjMyLDEuODUuMjl2LS4wMloiLz4KICA8L2c+Cjwvc3ZnPgo=";
