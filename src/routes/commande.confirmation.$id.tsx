import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { consumePendingWhatsAppUrl, clearPendingWhatsAppUrl } from "@/lib/notifications";

export const Route = createFileRoute("/commande/confirmation/$id")({ component: Confirm });

function Confirm() {
  const { id } = Route.useParams();
  const [waUrl, setWaUrl] = useState<string | null>(null);

  useEffect(() => {
    setWaUrl(consumePendingWhatsAppUrl());
    return () => clearPendingWhatsAppUrl();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="mt-6 font-display text-3xl sm:text-4xl">Merci pour votre commande !</h1>
      <p className="mt-3 text-muted-foreground">
        Votre commande <strong className="text-foreground">#{id}</strong> a bien été enregistrée.
        Nous vous contacterons très prochainement par téléphone ou WhatsApp pour confirmer la livraison.
      </p>

      {waUrl && (
        <div className="mt-8 rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-left">
          <p className="font-semibold text-green-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Dernière étape : envoyez votre commande à la vendeuse
          </p>
          <p className="mt-2 text-sm text-green-800">
            Cliquez sur le bouton ci-dessous pour transmettre les détails de votre commande directement à KGF BOUTIQUE sur WhatsApp.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 font-semibold shadow-sm transition"
          >
            <MessageCircle className="h-5 w-5" />
            Envoyer ma commande sur WhatsApp
          </a>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-accent/50 p-6 text-left text-sm">
        <p className="font-semibold">Prochaines étapes :</p>
        <ol className="mt-2 list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Notre équipe vous appelle pour confirmer.</li>
          <li>Préparation et expédition de votre colis.</li>
          <li>Livraison à votre adresse — paiement en espèces.</li>
        </ol>
      </div>
      <Link to="/" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium">
        Retour à la boutique
      </Link>
    </div>
  );
}
