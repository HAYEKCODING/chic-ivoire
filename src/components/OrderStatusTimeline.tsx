import { CheckCircle2, Clock, Package, Truck, Home, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "expediee"
  | "livree"
  | "annulee";

const STEPS: { key: OrderStatus; label: string; Icon: typeof Clock }[] = [
  { key: "en_attente", label: "En attente", Icon: Clock },
  { key: "confirmee", label: "Confirmée", Icon: CheckCircle2 },
  { key: "expediee", label: "Expédiée", Icon: Truck },
  { key: "livree", label: "Livrée", Icon: Home },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente: "En attente de confirmation",
  confirmee: "Commande confirmée",
  expediee: "Colis expédié",
  livree: "Commande livrée",
  annulee: "Commande annulée",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    en_attente: "bg-amber-100 text-amber-800 border-amber-200",
    confirmee: "bg-blue-100 text-blue-800 border-blue-200",
    expediee: "bg-indigo-100 text-indigo-800 border-indigo-200",
    livree: "bg-green-100 text-green-800 border-green-200",
    annulee: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "annulee") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center gap-3">
        <XCircle className="h-6 w-6 text-red-600 shrink-0" />
        <div>
          <p className="font-semibold text-red-900">Commande annulée</p>
          <p className="text-sm text-red-700">
            Contactez la boutique pour plus d'informations.
          </p>
        </div>
      </div>
    );
  }

  const activeIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <ol className="flex items-start justify-between gap-2">
        {STEPS.map((step, i) => {
          const done = i <= activeIndex;
          const current = i === activeIndex;
          const Icon = step.Icon;
          return (
            <li
              key={step.key}
              className="flex flex-1 flex-col items-center text-center relative"
            >
              {i > 0 && (
                <span
                  className={cn(
                    "absolute top-5 right-1/2 h-0.5 w-full -z-10",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground",
                  current && "ring-4 ring-primary/20",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "mt-2 text-[11px] sm:text-xs font-medium leading-tight",
                  done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { STATUS_LABEL };
