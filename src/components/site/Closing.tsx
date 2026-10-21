import Image from "next/image";
import { Reveal, SectionHeader } from "./primitives";
import type { DocumentItem, Partner } from "@/lib/queries";

export function FounderMessage() {
  return (
    <section className="border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">Pesan Pendiri</p>
            <blockquote className="mt-8">
              <p className="font-display text-[clamp(2rem,4.2vw,3.5rem)] font-light leading-[1.08] tracking-tight text-ink">
                “Perubahan yang sungguh-sungguh dimulai ketika kita memilih untuk peduli.”
              </p>
            </blockquote>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-10 max-w-lg text-sm leading-relaxed text-muted">
              Kesediaan untuk tetap tinggal ketika perhatian publik sudah berpindah.
              Itulah pekerjaan kami di ALTARA.
            </p>
            <div className="hairline mt-10 pt-6">
              <p className="font-display text-xl leading-none text-ink">Altara Pradana</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                Pendiri & Ketua Dewan Pembina
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal className="overflow-hidden lg:col-span-4 lg:col-start-9">
          <img
            src="/assets/founder.jpg"
            alt="Potret pendiri Yayasan Abdi Laksata Raya"
            loading="lazy"
            width={1104}
            height={1408}
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Transparency({ documents }: { documents: DocumentItem[] }) {
  const allocation = [
    { label: "Program lapangan", value: 84 },
    { label: "Riset & pengembangan program", value: 9 },
    { label: "Operasional & tata kelola", value: 7 },
  ];
  return (
    <section id="transparansi" className="scroll-mt-24 border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Transparansi"
            title="Setiap rupiah punya jejak."
            description="Laporan kami diaudit secara independen setiap tahun dan dipublikasikan tanpa permintaan."
          />
          <Reveal delay={140} className="mt-12 space-y-7">
            {allocation.map((item) => (
              <div key={item.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink">{item.label}</span>
                  <span className="font-display text-xl leading-none text-ink">{item.value}%</span>
                </div>
                <div className="mt-3 h-px w-full bg-line">
                  <div className="h-px bg-forest" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </Reveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="eyebrow">Dokumen Publik</p>
            <ul className="mt-8">
              {documents.map((doc) => (
                <li key={doc.title}>
                  <a
                    href={doc.fileUrl || "#transparansi"}
                    className="hairline group flex items-center justify-between gap-6 py-6"
                  >
                    <span>
                      <span className="block font-display text-xl font-light leading-snug text-ink group-hover:text-forest">
                        {doc.title}
                      </span>
                      <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                        {doc.meta}
                      </span>
                    </span>
                    <span aria-hidden className="text-muted">↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Partners({ partners }: { partners: Partner[] }) {
  return (
    <section className="border-t border-line py-16 lg:py-20">
      <div className="shell">
        <Reveal className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <p className="eyebrow shrink-0 lg:max-w-[9rem]">Mitra & Pendukung</p>
          <ul className="grid w-full grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((partner) => (
              <li key={partner.id} className="font-display text-base leading-tight text-muted">
                {partner.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function SupportCTA() {
  return (
    <section id="dukung" className="scroll-mt-24 border-t border-line">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[38rem]">
          <img
            src="/assets/cta.jpg"
            alt="Tangan warga dan pendamping program"
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="bg-ink px-6 py-20 text-parchment md:px-14 lg:px-20 lg:py-28">
          <Reveal>
            <p className="eyebrow text-parchment/60">Dukung Kami</p>
            <h2 className="display-lg mt-7 font-display text-parchment">
              Kepedulian yang berlanjut menjadi perubahan.
            </h2>
          </Reveal>
          <Reveal delay={200} className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a href="#dukung" className="bg-ivory px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-ink">
              Donasi Sekarang
            </a>
            <a href="#transparansi" className="border border-parchment/40 px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-parchment">
              Bicarakan Kemitraan
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="shell py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Image
              src="/assets/logo.png"
              alt="Yayasan Abdi Laksata Raya"
              width={2000}
              height={2000}
              sizes="96px"
              className="h-24 w-auto object-contain object-left"
            />
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Lembaga filantropi independen sejak 2016. SK Kemenkumham AHU-XXXX.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3" aria-label="Navigasi footer">
            {[
              { label: "Tentang", href: "#tentang" },
              { label: "Program", href: "#program" },
              { label: "Dampak", href: "#dampak" },
              { label: "Cerita", href: "#cerita" },
              { label: "Jurnal", href: "#jurnal" },
              { label: "Transparansi", href: "#transparansi" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="eyebrow hairline mt-16 pt-7">
          © 2026 Yayasan Abdi Laksata Raya · Privasi · Kontak
        </p>
      </div>
    </footer>
  );
}
