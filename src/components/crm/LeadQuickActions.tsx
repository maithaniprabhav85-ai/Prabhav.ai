import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCrm } from "@/lib/crm/context";
import type { Lead } from "@/lib/crm/types";

export function LeadQuickActions({ lead }: { lead: Lead }) {
  const { logLeadContact } = useCrm();
  const phone = lead.phone.replace(/\D/g, "");
  const message = encodeURIComponent(`Hi ${lead.contactPerson}, this is from Pixel Infinite AI...`);
  const actions = [
    { label: "WhatsApp", href: `https://wa.me/${phone}?text=${message}`, icon: MessageCircle, channel: "whatsapp" as const },
    { label: "Call", href: `tel:${lead.phone}`, icon: Phone, channel: "call" as const },
    { label: "Email", href: `mailto:${lead.email}`, icon: Mail, channel: "email" as const },
  ];

  return (
    <div className="flex items-center gap-1" aria-label={`Contact ${lead.contactPerson}`}>
      {actions.map(({ label, href, icon: Icon, channel }) => (
        <Tooltip key={channel}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon">
              <a
                href={href}
                target={channel === "whatsapp" ? "_blank" : undefined}
                rel={channel === "whatsapp" ? "noreferrer" : undefined}
                aria-label={`${label} ${lead.contactPerson}`}
                onClick={() => logLeadContact(lead.id, channel)}
              >
                <Icon className="size-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}