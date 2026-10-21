import { HeroSlider } from "./HeroSlider";

/**
 * Hero section — shell server component.
 * Semua state dan animasi ada di HeroSlider (client component).
 * Dipisah agar page.tsx tetap bisa fetch data di server tanpa
 * menarik seluruh slider ke server bundle.
 */
export function Hero() {
  return (
    <section id="top" aria-label="Hero">
      <HeroSlider />
    </section>
  );
}
