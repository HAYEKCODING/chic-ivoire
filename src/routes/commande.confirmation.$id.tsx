import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/commande/confirmation/$id")({ component: Confirm });

function Confirm() {
  const { id } = Route.useParams();
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
