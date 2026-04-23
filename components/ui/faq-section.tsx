import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What services does Square Experience offer?",
    answer:
      "Square Experience provides end-to-end software solutions including custom business systems, UI/UX design, web and mobile app development, API integrations, workflow automation, DevOps, and ongoing technical support. We serve industries from logistics and e-commerce to education and hospitality.",
  },
  {
    question: "How do I get started with a new project?",
    answer:
      "Simply reach out through our contact form or email us at team@squareexp.com. Our team will schedule a discovery call to understand your requirements, timeline, and budget. From there, we provide a detailed proposal and project roadmap tailored to your business goals.",
  },
  {
    question: "What is the typical turnaround time for a project?",
    answer:
      "Turnaround times vary based on complexity. An MVP can be delivered in 4–6 weeks, while full-scale enterprise platforms may take 3–6 months. During our initial consultation, we provide realistic timelines with milestone checkpoints so you always know where your project stands.",
  },
  {
    question: "Do you offer ongoing maintenance and support?",
    answer:
      "Yes. We offer dedicated maintenance and support plans that include bug fixes, performance monitoring, security patches, and feature updates. Our support team is available 24/7 for critical issues, and we provide SLA-backed response times for enterprise clients.",
  },
  {
    question: "How do I report a technical issue?",
    answer:
      "Use the 'Report a Case' section at the bottom of this page. Select the type of issue from the dropdown, describe the problem in detail, and our engineering team will triage and respond within 4 hours for critical issues and 24 hours for standard requests.",
  },
  {
    question: "Can I upgrade or change my plan later?",
    answer:
      "Absolutely. All our plans are flexible. You can upgrade, downgrade, or customize your plan at any time. Changes take effect immediately, and any pricing adjustments are prorated to your billing cycle. Contact our billing team for assistance.",
  },
  {
    question: "Is my data secure with Square Experience?",
    answer:
      "Security is foundational to everything we build. We implement industry-standard encryption (AES-256), role-based access control, audit logging, and regular security assessments. Our infrastructure runs on enterprise-grade cloud providers with SOC 2 compliance standards.",
  },
  {
    question: "Do you work with clients outside of Africa?",
    answer:
      "Yes. While we have strong roots in Nigeria and Tanzania, we serve clients globally including North America, Europe, and the Middle East. Our Canadian office supports clients in the Americas timezone, and our distributed team ensures seamless collaboration across regions.",
  },
];

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {FAQS.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border border-zinc-200 rounded-2xl px-6 bg-white data-[state=open]:shadow-sm"
        >
          <AccordionTrigger className="text-zinc-800 hover:no-underline text-left text-base font-medium py-5">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-zinc-500 leading-relaxed pb-5">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
