import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KGF BOUTIQUE — Mode féminine ivoirienne" },
      {
        name: "description",
        content:
          "KGF BOUTIQUE — Boutique en ligne de mode féminine en Côte d'Ivoire : boubous, bijoux, sacs, chaussures, accessoires et beauté. Paiement à la livraison.",
      },
      { property: "og:title", content: "KGF BOUTIQUE — Mode féminine ivoirienne" },
      { property: "og:description", content: "KGF BOUTIQUE — mode féminine ivoirienne, livraison partout en Côte d'Ivoire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { httpEquiv: "Content-Language", content: "fr" },
      { name: "twitter:title", content: "KGF BOUTIQUE — Mode féminine ivoirienne" },
      { name: "twitter:description", content: "KGF BOUTIQUE — mode féminine ivoirienne, livraison partout en Côte d'Ivoire." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28da4fe6-80d0-4cac-9f07-36391ccd91d0/id-preview-c10ec6e6--3afb39f5-201d-45e2-8149-85177bc8b859.lovable.app-1778106379623.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28da4fe6-80d0-4cac-9f07-36391ccd91d0/id-preview-c10ec6e6--3afb39f5-201d-45e2-8149-85177bc8b859.lovable.app-1778106379623.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Page introuvable.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-primary-foreground font-medium">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl text-primary">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}
