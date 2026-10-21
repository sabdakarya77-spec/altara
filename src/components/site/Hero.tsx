export function Hero() {
  return (
    <section id="top" className="relative isolate min-h-[88svh] w-full overflow-hidden bg-ink lg:min-h-[92svh]">
      <img
        src="/assets/hero.jpg"
        alt="Seorang guru mendampingi anak-anak membaca di ruang kelas sederhana di sebuah desa"
        width={1920}
        height={1200}
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/25"
      />
      <div className="shell relative flex min-h-[88svh] flex-col justify-end pb-16 pt-32 lg:min-h-[92svh] lg:pb-24">
        <div className="max-w-4xl">
          <p className="eyebrow text-parchment/70">Tujuan Kami</p>
          <h1 className="display-hero mt-7 font-display text-parchment">
            Manunggaling Kawulane
            <br />
            Gusti
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-parchment/80 sm:text-lg">
            Yayasan Abdi Laksata Raya bekerja bersama masyarakat Indonesia untuk menciptakan
            kesempatan yang bermakna melalui pendidikan, pemberdayaan, kemanusiaan,
            dan lingkungan.
          </p>
          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
        <div className="mt-16 flex items-center gap-4 lg:mt-20">
          <span className="text-[0.62rem] uppercase tracking-[0.24em] text-parchment/60">
            Gulir
          </span>
          <span aria-hidden className="relative h-px w-16 overflow-hidden bg-parchment/25" />
        </div>
      </div>
    </section>
  );
}
