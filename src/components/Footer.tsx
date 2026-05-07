export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-accent/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl text-primary">KGF <span className="text-gold">BOUTIQUE</span></h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Mode féminine raffinée, fièrement ivoirienne. Boubous, bijoux, sacs et plus encore.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Paiement à la livraison</li>
            <li>Livraison à Abidjan & toute la Côte d'Ivoire</li>
            <li>Service client : 7j/7</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              WhatsApp :{" "}
              <a href="https://wa.me/2250711598503" target="_blank" rel="noreferrer" className="hover:text-primary">
                +225 07 11 59 85 03
              </a>
            </li>
            <li>
              Téléphone :{" "}
              <a href="tel:+2250711598503" className="hover:text-primary">+225 07 11 59 85 03</a>
            </li>
            <li>Abidjan, Côte d'Ivoire</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} KGF BOUTIQUE — Tous droits réservés.
      </div>
    </footer>
  );
}
