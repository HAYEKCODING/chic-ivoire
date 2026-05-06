import boubou1 from "@/assets/p-boubou-1.jpg";
import boubou2 from "@/assets/p-boubou-2.jpg";
import bijoux1 from "@/assets/p-bijoux-1.jpg";
import bijoux2 from "@/assets/p-bijoux-2.jpg";
import sac1 from "@/assets/p-sac-1.jpg";
import sac2 from "@/assets/p-sac-2.jpg";
import chaussure1 from "@/assets/p-chaussure-1.jpg";
import chaussure2 from "@/assets/p-chaussure-2.jpg";
import acc1 from "@/assets/p-acc-1.jpg";
import acc2 from "@/assets/p-acc-2.jpg";
import beaute1 from "@/assets/p-beaute-1.jpg";
import beaute2 from "@/assets/p-beaute-2.jpg";

const map: Record<string, string> = {
  "p-boubou-1.jpg": boubou1, "p-boubou-2.jpg": boubou2,
  "p-bijoux-1.jpg": bijoux1, "p-bijoux-2.jpg": bijoux2,
  "p-sac-1.jpg": sac1, "p-sac-2.jpg": sac2,
  "p-chaussure-1.jpg": chaussure1, "p-chaussure-2.jpg": chaussure2,
  "p-acc-1.jpg": acc1, "p-acc-2.jpg": acc2,
  "p-beaute-1.jpg": beaute1, "p-beaute-2.jpg": beaute2,
};

export function resolveImage(url: string | null | undefined): string {
  if (!url) return boubou1;
  const file = url.split("/").pop() ?? "";
  return map[file] ?? url;
}
