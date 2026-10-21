"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Data slide (hardcode Sprint 2, akan dipindah ke DB di Sprint 4+) ─── */
const SLIDES = [
  {
    src: "/assets/hero.jpg",
    alt: "Seorang guru mendampingi anak-anak membaca di ruang kelas sederhana di sebuah desa",
    location: "Jawa Tengah",
    headline: "Manunggaling\nKawulane Gusti",
    caption: "Mendampingi setiap langkah menuju masa depan yang bermartabat",
    kenBurns: "zoom-in",
    objectPosition: "center 35%",   // subjek (guru + anak) di sepertiga atas
  },
  {
    src: "/assets/story-feature.jpg",
    alt: "Perempuan penerima manfaat program pemberdayaan ALTARA tersenyum di depan rumahnya",
    location: "Yogyakarta",
    headline: "Satu Keluarga,\nSatu Harapan",
    caption: "Pemberdayaan dimulai dari kepercayaan yang kita bangun bersama",
    kenBurns: "pan-left",
    objectPosition: "center top",    // wajah terpotong di atas — tampilkan dari puncak
  },
  {
    src: "/assets/program-education.jpg",
    alt: "Anak-anak mengikuti program pendidikan komunitas ALTARA",
    location: "Jawa Timur",
    headline: "Pendidikan\nUntuk Semua",
    caption: "Akses pendidikan yang setara sebagai fondasi perubahan nyata",
    kenBurns: "zoom-out",
    objectPosition: "center 40%",   // komposisi kelas, tetap di tengah
  },
  {
    src: "/assets/about.jpg",
    alt: "Komunitas masyarakat berkumpul bersama relawan ALTARA",
    location: "Nusantara",
    headline: "Bersama\nKita Tumbuh",
    caption: "Dari pelosok desa hingga kota, kami hadir mendampingi",
    kenBurns: "pan-right",
    objectPosition: "center 30%",   // foto komunitas, tepatkan di atas tengah
  },
  {
    src: "/assets/program-empowerment.jpg",
    alt: "Peserta program pemberdayaan ekonomi ALTARA menampilkan hasil karyanya",
    location: "Jawa Barat",
    headline: "Mandiri\nBerdaya Bangsa",
    caption: "Keterampilan nyata yang membuka jalan menuju kemandirian",
    kenBurns: "zoom-in-slow",
    objectPosition: "center 45%",   // subjek di tengah, sedikit ke bawah
  },
] as const;

const INTERVAL = 6000; // ms
const FADE_DURATION = 900; // ms — harus selaras dengan CSS transition

/* ─── Komponen utama ─────────────────────────────────────────────────── */
export function HeroSlider() {
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
    () => goTo((current + 1) % SLIDES.length, "next"),
    [current, goTo]
  );

  const goPrev = useCallback(
    () => goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev"),
    [current, goTo]
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

  const slide = SLIDES[current];

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
      {prev !== null && (
        <div className="hero-slide hero-slide--out" aria-hidden>
          <div className={`hero-kb hero-kb--${SLIDES[prev].kenBurns}`}>
            <Image
              src={SLIDES[prev].src}
              alt={SLIDES[prev].alt}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: SLIDES[prev].objectPosition }}
            />
          </div>
        </div>
      )}

      {/* Foto saat ini (fade in) */}
      <div className="hero-slide hero-slide--in">
        <div className={`hero-kb hero-kb--${slide.kenBurns}`} key={current}>
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={current === 0}
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
            <span className="h-px w-3 bg-parchment/30" aria-hidden />
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-goldsoft">
              {slide.location}
            </span>
          </div>

          {/* Headline per slide */}
          <h1 className="display-hero mt-6 whitespace-pre-line font-display text-parchment">
            {slide.headline}
          </h1>

          {/* Caption per slide */}
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-parchment/70 sm:text-base">
            {slide.caption}
          </p>

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
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}: ${s.location}`}
                  onClick={() => goTo(i)}
                  className={`hero-dot ${i === current ? "hero-dot--active" : ""}`}
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

      {/* ── Caption lokasi ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="hero-location"
        style={{ opacity: textVisible ? 1 : 0 }}
      >
        <span className="inline-block h-px w-4 bg-parchment/40 align-middle" />
        <span className="ml-2">{slide.location}</span>
      </div>

      {/* ── Progress bar ──────────────────────────────────────────── */}
      {!reducedMotion && (
        <div className="hero-progress-track" aria-hidden>
          <div
            className="hero-progress-fill"
            style={{ width: paused ? `${progress}%` : `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
