import { Reveal, SectionHeader } from "./primitives";
import type { Program } from "@/lib/queries";

export function Intro() {
  return (
    <section className="shell py-24 md:py-32 lg:py-40">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-3">
          <p className="eyebrow">Siapa Kami</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Sebuah yayasan filantropi independen yang bekerja di 34 kota Indonesia.
          </p>
        </Reveal>
        <div className="lg:col-span-8 lg:col-start-5">
          <Reveal>
            <p className="display-md font-display text-ink">
              Kami percaya perubahan yang berarti dimulai dari kesempatan untuk tumbuh,
              untuk belajar, dan untuk membangun masa depan yang lebih baik.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
            <p className="text-sm leading-relaxed text-muted">
              Sejak 2016, Yayasan Abdi Laksata Raya mendampingi komunitas di Indonesia dengan
              pendekatan jangka panjang: mendengarkan lebih dahulu, membangun bersama,
              lalu menyerahkan kepemilikan kepada masyarakat sendiri.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              Kami mengukur keberhasilan dari seberapa lama sebuah program tetap hidup
              setelah kami tidak lagi berada di sana — satu generasi, lalu generasi
              berikutnya.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function AboutFoundation() {
  const pillars = [
    {
      label: "Misi",
      text: "Menciptakan akses yang setara terhadap pendidikan, penghidupan, dan martabat bagi masyarakat yang paling jauh dari pusat perhatian.",
    },
    {
      label: "Visi",
      text: "Indonesia di mana tempat seseorang dilahirkan tidak lagi menentukan sejauh mana ia dapat bertumbuh.",
    },
    {
      label: "Nilai",
      text: "Kerendahan hati dalam mendengar, ketelitian dalam bekerja, keterbukaan dalam melaporkan, dan kesetiaan pada jangka panjang.",
    },
  ];
  return (
    <section id="tentang" className="scroll-mt-24 border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Tentang Yayasan</p>
            <h2 className="display-lg mt-6 font-display text-ink">
              Tujuan yang Melampaui
              <br />
              Satu Generasi.
            </h2>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="body-lead max-w-xl">
              Yayasan Abdi Laksata Raya didirikan pada tahun 2016 oleh sekelompok pendidik dan
              pengusaha yang percaya bahwa filantropi harus dijalankan dengan disiplin
              sebuah institusi, dan kehangatan sebuah keluarga.
            </p>
          </Reveal>
        </div>
        <Reveal className="mt-16 overflow-hidden lg:mt-24">
          <img
            src="/assets/about.jpg"
            alt="Musyawarah desa yang didampingi ALTARA"
            loading="lazy"
            width={1600}
            height={1104}
            className="aspect-[16/9] w-full object-cover"
          />
          <p className="mt-4 text-xs text-muted">Musyawarah desa binaan ALTARA. Arsip yayasan.</p>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-12 lg:mt-24">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.label} delay={i * 90} className="hairline pt-6">
              <h3 className="font-display text-2xl font-light leading-none text-ink">
                {pillar.label}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-muted">{pillar.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProgramList({ programs }: { programs: Program[] }) {
  return (
    <section id="program" className="scroll-mt-24 border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          eyebrow="Program Kami"
          title="Empat jalan kerja, satu tujuan jangka panjang."
        />
        <div className="relative mt-16 lg:mt-20">
          {programs.map((program, i) => (
            <Reveal key={program.index} delay={i * 90}>
              <a
                href="#cerita"
                className="hairline group block py-9 transition-colors duration-500 hover:border-ink/60 md:py-12"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-baseline md:gap-8">
                  <span className="text-[0.62rem] tracking-[0.24em] text-muted md:col-span-1">
                    {program.index}
                  </span>
                  <h3 className="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-light leading-none tracking-tight text-ink transition-transform duration-500 group-hover:translate-x-1 md:col-span-5">
                    {program.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-muted md:col-span-4">
                    {program.description}
                  </p>
                  <span
                    aria-hidden
                    className="text-lg text-muted transition-all duration-500 group-hover:translate-x-2 group-hover:text-ink md:col-span-2 md:justify-self-end"
                  >
                    →
                  </span>
                </div>
                <img
                  src={program.image}
                  alt={program.alt}
                  loading="lazy"
                  className="mt-7 h-56 w-full object-cover sm:h-72 lg:hidden"
                />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
