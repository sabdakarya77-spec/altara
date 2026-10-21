"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

type EmblemProps = {
  className?: string;
  priority?: boolean;
  /** Petakan lebar render aktual supaya Next.js tidak mengirim gambar kelewat besar. */
  sizes?: string;
};

/**
 * Emblem ALTARA — hanya bagian lambang (bintang, bulan, manusia, daun, air).
 * Sumber: public/assets/logo.png (di-crop), dipakai untuk navbar & favicon.
 */
export function Emblem({ className = "", priority = false, sizes = "40px" }: EmblemProps) {
  return (
    <Image
      src="/assets/logo-emblem.png"
      alt="Lambang Yayasan Abdi Laksata Raya"
      width={583}
      height={640}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}

type LockupProps = {
  /** "light" untuk latar gelap (hero), "dark" untuk latar terang. */
  tone?: "light" | "dark";
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Lockup horizontal: lambang + wordmark ALTARA.
 * Wordmark memakai Cormorant agar konsisten dengan tipografi editorial situs.
 */
export function Lockup({
  tone = "dark",
  className = "",
  priority = false,
  sizes = "40px",
}: LockupProps) {
  const isLight = tone === "light";
  return (
    <span className={`flex items-center gap-3.5 ${className}`}>
      <Emblem className="size-9 shrink-0 object-contain" priority={priority} sizes={sizes} />
      <span className="min-w-0">
        <span
          className={`block truncate font-display text-lg leading-none tracking-tight ${
            isLight ? "text-parchment" : "text-ink"
          }`}
        >
          ALTARA
        </span>
        <span
          className={`mt-0.5 block text-[0.55rem] uppercase tracking-[0.18em] sm:text-[0.6rem] sm:tracking-[0.2em] leading-none ${
            isLight ? "text-parchment/70" : "text-muted"
          }`}
        >
          Abdi Laksata Raya
        </span>
      </span>
    </span>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      {title ? <h2 className="display-lg mt-6 font-display text-ink">{title}</h2> : null}
      {description ? <p className="body-lead mt-6 max-w-xl">{description}</p> : null}
    </Reveal>
  );
}
