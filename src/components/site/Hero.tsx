import type { HeroSlide } from "@/lib/queries";
import { HeroSlider } from "./HeroSlider";

/**
 * Hero section — shell server component.
 * Menerima `slides` dari database (via page.tsx) dan meneruskannya
 * ke HeroSlider (client component).
 */
export function Hero({ slides }: { slides?: HeroSlide[] }) {
  return (
    <section id="top" aria-label="Hero">
      <HeroSlider slides={slides} />
    </section>
  );
}
