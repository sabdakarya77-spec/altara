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
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /* Deteksi prefers-reduced-motion hanya di client */
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Navigasi ke slide target */
  const goTo = useCallback(
    (target: number, dir?: "next" | "prev") => {
      if (transitioning || target === current) return;
      void dir;
      setTransitioning(true);
      setTextVisible(false); // teks lama fade-out lebih dulu

      setPrev(current);
      setTimeout(() => {
        setCurrent(target);
        setTransitioning(false);
        setProgress(0);
        startTimeRef.current = Date.now();
        // teks baru muncul setelah foto mulai tampil
        setTimeout(() => setTextVisible(true), 200);
        setPrev(null);
      }, FADE_DURATION);
    },
    [current, transitioning]
  );

  const goNext = useCallback(
    () => goTo((current + 1) % activeSlides.length, "next"),
    [current, goTo, activeSlides.length]
  );

  const goPrev = useCallback(
    () => goTo((current - 1 + activeSlides.length) % activeSlides.length, "prev"),
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

  /* Progress bar */
  useEffect(() => {
    if (paused || reducedMotion) {
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 50);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, paused, reducedMotion]);

  /* Teks muncul saat pertama load */
  useEffect(() => {
    const t = setTimeout(() => setTextVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

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

          {/* Headline per slide */}
          <h1 className="display-hero mt-6 whitespace-pre-line font-display text-parchment">
            {slide.headline}
          </h1>

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

      {/* ── Progress bar ──────────────────────────────────────────── */}
      {!reducedMotion && (
        <div className="hero-progress-track" aria-hidden>
          <div
            className="hero-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
