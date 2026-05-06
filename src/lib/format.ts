export const formatXOF = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
