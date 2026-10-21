"use client";

import { useEffect, useState } from "react";
import { Lockup } from "./primitives";

const links = [
  { label: "Tentang", href: "#tentang" },
  { label: "Program", href: "#program" },
  { label: "Dampak", href: "#dampak" },
  { label: "Cerita", href: "#cerita" },
  { label: "Jurnal", href: "#jurnal" },
  { label: "Transparansi", href: "#transparansi" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  const onHero = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        onHero
          ? "bg-transparent"
          : "border-b border-line/70 bg-ivory/85 backdrop-blur-xl"
      }`}
    >
      <div className="shell">
        <div
          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center transition-all duration-500 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${
            onHero ? "py-7" : "py-4"
          }`}
        >
          <a
            href="#top"
            className="flex min-w-0 items-center gap-3 transition-colors duration-500"
            aria-label="Yayasan Abdi Laksata Raya — kembali ke atas"
          >
            <Lockup tone={onHero ? "light" : "dark"} priority />
          </a>

          <nav className="hidden justify-center gap-9 lg:flex" aria-label="Navigasi utama">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-[0.8rem] tracking-wide transition-colors duration-300 ${
                  onHero
                    ? "text-parchment/80 hover:text-parchment"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-4">
            <a
              href="#dukung"
              className={`hidden border px-6 py-3 text-[0.72rem] uppercase tracking-[0.18em] transition-colors duration-300 lg:inline-block ${
                onHero
                  ? "border-parchment/50 text-parchment hover:bg-parchment hover:text-ink"
                  : "border-ink bg-ink text-parchment hover:bg-forest hover:border-forest"
              }`}
            >
              Dukung Kami
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className={`relative z-50 grid size-10 place-items-center lg:hidden ${
                onHero ? "text-parchment" : "text-ink"
              }`}
            >
              <span className="sr-only">Menu</span>
              <span className="flex w-6 flex-col gap-[6px]">
                <span
                  className={`h-px w-full bg-current transition-transform duration-300 ${
                    open && "translate-y-[3.5px] rotate-45"
                  }`}
                />
                <span
                  className={`h-px w-full bg-current transition-transform duration-300 ${
                    open && "-translate-y-[3.5px] -rotate-45"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-ivory transition-opacity duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="shell flex h-full flex-col pb-12 pt-28">
          <nav className="flex flex-col" aria-label="Navigasi seluler">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hairline flex items-baseline justify-between py-5 font-display text-3xl text-ink"
              >
                {link.label}
                <span className="text-[0.65rem] tracking-[0.2em] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </a>
            ))}
          </nav>
          <div className="mt-auto">
            <a
              href="#dukung"
              onClick={() => setOpen(false)}
              className="block bg-ink px-6 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-parchment"
            >
              Dukung Kami
            </a>
            <p className="mt-6 text-xs text-muted">Jakarta · Yogyakarta · Kupang</p>
          </div>
        </div>
      </div>
    </header>
  );
}
