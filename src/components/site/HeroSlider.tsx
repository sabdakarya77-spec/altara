"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import type { HeroSlide } from "@/data/hero-slides";
import { DEFAULT_HERO_SLIDES } from "@/data/hero-slides";

const INTERVAL = 6000; // ms
const FADE_DURATION = 900; // ms — harus selaras dengan CSS transition

/* ─── Komponen utama ─────────────────────────────────────────────────── */
export function HeroSlider({ slides }: { slides?: HeroSlide[] }) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  // progressKey berubah setiap slide berganti → CSS animation restart otomatis
  const [progressKey, setProgressKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Timeout refs untuk dibersihkan saat unmount
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  /* Deteksi prefers-reduced-motion hanya di client */
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Cleanup semua timeout/interval saat unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
      if (initTextTimeoutRef.current) clearTimeout(initTextTimeoutRef.current);
    };
  }, []);

  /* Navigasi ke slide target */
  const goTo = useCallback(
    (target: number) => {
      if (transitioning || target === current) return;
      setTransitioning(true);
      setTextVisible(false); // teks lama fade-out lebih dulu

      setPrev(current);
      fadeTimeoutRef.current = setTimeout(() => {
        setCurrent(target);
        setTransitioning(false);
        setProgressKey((k) => k + 1); // restart CSS progress animation
        // teks baru muncul setelah foto mulai tampil
        textTimeoutRef.current = setTimeout(() => setTextVisible(true), 200);
        setPrev(null);
      }, FADE_DURATION);
    },
    [current, transitioning]
  );

  const goNext = useCallback(
    () => goTo((current + 1) % activeSlides.length),
    [current, goTo, activeSlides.length]
  );

  const goPrev = useCallback(
    () => goTo((current - 1 + activeSlides.length) % activeSlides.length),
    [current, goTo, activeSlides.length]
  );

  /* Autoplay */
  useEffect(() => {
    if (paused || reducedMotion) return;
    timerRef.current = setInterval(goNext, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, paused, reducedMotion]);

  /* Teks muncul saat pertama load */
  useEffect(() => {
    initTextTimeoutRef.current = setTimeout(() => setTextVisible(true), 400);
    return () => {
      if (initTextTimeoutRef.current) clearTimeout(initTextTimeoutRef.current);
    };
  }, []);

  /* Touch: swipe kiri/kanan untuk navigasi, tanpa memblokir scroll vertikal */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;
      // Hanya trigger swipe bila gerakan lebih horizontal daripada vertikal
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goNext, goPrev]
  );

  // Pastikan current index tidak out-of-bounds jika slides berubah dinamis
  const safeCurrent = current < activeSlides.length ? current : 0;
  const slide = activeSlides[safeCurrent] ?? activeSlides[0];

  return (
    <div
      className="hero-slider-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Layer foto ─────────────────────────────────────────────── */}
      {/* Foto sebelumnya (fade out) */}
      {prev !== null && activeSlides[prev] && (
        <div className="hero-slide hero-slide--out" aria-hidden>
          <div className={`hero-kb hero-kb--${activeSlides[prev].kenBurns}`}>
            <Image
              src={activeSlides[prev].imageUrl}
              alt={activeSlides[prev].alt || ""}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: activeSlides[prev].objectPosition }}
            />
          </div>
        </div>
      )}

      {/* Foto saat ini (fade in) */}
      <div className="hero-slide hero-slide--in">
        <div className={`hero-kb hero-kb--${slide.kenBurns}`} key={safeCurrent}>
          <Image
            src={slide.imageUrl}
            alt={slide.alt || ""}
            fill
            sizes="100vw"
            priority={safeCurrent === 0}
            className="object-cover"
            style={{ objectPosition: slide.objectPosition }}
          />
        </div>
      </div>

      {/* ── Gradient overlay ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/40 to-ink/18"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/30 to-transparent"
      />

      {/* ── Konten teks ───────────────────────────────────────────── */}
      <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:pb-20 sm:pt-32 lg:min-h-[92svh] lg:pb-28">
        <div
          className="hero-text max-w-4xl"
          style={{
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? "none" : "translateY(14px)",
          }}
        >
          {/* Eyebrow & Lokasi */}
          <div className="flex items-center gap-2.5">
            <p className="eyebrow text-parchment/70">Tujuan Kami</p>
            {slide.location ? (
              <>
                <span className="h-px w-3 bg-parchment/30" aria-hidden />
                <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-goldsoft">
                  {slide.location}
                </span>
              </>
            ) : null}
          </div>

          {/*
           * Headline per slide.
           * Menggunakan <p> bukan <h1> karena:
           * - Tiap halaman hanya boleh punya satu <h1> (SEO + aksesibilitas)
           * - <h1> sudah ada di konten utama di bawah hero
           * - Teks ini bersifat dekoratif/slogan, bukan heading struktural
           */}
          <p
            className="display-hero mt-6 whitespace-pre-line font-display text-parchment"
            aria-label={slide.headline}
          >
            {slide.headline}
          </p>

          {/* Caption per slide */}
          {slide.caption ? (
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-parchment/70 sm:text-base">
              {slide.caption}
            </p>
          ) : null}

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#dampak"
              className="bg-ivory px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-forest hover:text-parchment"
            >
              Jelajahi Dampak Kami
            </a>
            <a
              href="#tentang"
              className="border border-parchment/45 px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-parchment transition-colors duration-300 hover:bg-parchment/10"
            >
              Tentang Yayasan
            </a>
          </div>
        </div>

        {/* ── Footer baris: scroll hint + controls ──────────────── */}
        <div className="mt-12 flex items-end justify-between lg:mt-16">
          {/* Scroll hint */}
          <div className="flex items-center gap-4">
            <span className="text-[0.62rem] uppercase tracking-[0.24em] text-parchment/50">
              Gulir
            </span>
            <span
              aria-hidden
              className="relative h-px w-16 overflow-hidden bg-parchment/20"
            />
          </div>

          {/* Dots + prev/next */}
          <div className="flex items-center gap-5">
            {/* Prev */}
            <button
              onClick={goPrev}
              aria-label="Slide sebelumnya"
              className="hero-nav-btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide">
              {activeSlides.map((s, i) => (
                <button
                  key={s.id ?? i}
                  role="tab"
                  aria-selected={i === safeCurrent}
                  aria-label={`Slide ${i + 1}: ${s.location || ""}`}
                  onClick={() => goTo(i)}
                  className={`hero-dot ${i === safeCurrent ? "hero-dot--active" : ""}`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={goNext}
              aria-label="Slide berikutnya"
              className="hero-nav-btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Caption lokasi (desktop corner) ───────────────────────── */}
      {slide.location ? (
        <div
          aria-hidden
          className="hero-location"
          style={{ opacity: textVisible ? 1 : 0 }}
        >
          <span className="inline-block h-px w-4 bg-parchment/40 align-middle" />
          <span className="ml-2">{slide.location}</span>
        </div>
      ) : null}

      {/* ── Progress bar — CSS animation, bukan JS interval ──────── */}
      {!reducedMotion && !paused && (
        <div className="hero-progress-track" aria-hidden>
          {/*
           * key={progressKey} memaksa React me-remount elemen ini setiap
           * slide berganti, sehingga CSS animation selalu mulai dari 0.
           * Tidak ada setInterval 50ms — lebih efisien dan tidak freeze.
           */}
          <div
            key={progressKey}
            className="hero-progress-fill hero-progress-fill--animated"
          />
        </div>
      )}
    </div>
  );
}
