import Image from "next/image";
import { Reveal, SectionHeader } from "./primitives";
import type { DocumentItem, Partner } from "@/lib/queries";
import type { SiteSettings } from "@/data/settings";

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

function cleanWaNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function SupportCTA({ settings }: { settings?: SiteSettings }) {
  const waUrl = settings?.contact_whatsapp
    ? `https://wa.me/${cleanWaNumber(settings.contact_whatsapp)}?text=${encodeURIComponent(
        "Halo ALTARA, saya ingin berkonsultasi mengenai dukungan / donasi program."
      )}`
    : "#dukung";

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
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-parchment/70">
              Setiap donasi disalurkan langsung ke program lapangan dengan audit berkala dan laporan berkas publik yang dapat diakses siapa saja.
            </p>
          </Reveal>

          {settings?.bank_account_no ? (
            <Reveal delay={120} className="mt-8 rounded-lg border border-parchment/15 bg-parchment/5 p-6 backdrop-blur-sm">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gold">Rekening Resmi Yayasan</p>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-xl text-parchment">{settings.bank_name}</span>
                <span className="font-mono text-lg font-medium tracking-wider text-parchment">
                  {settings.bank_account_no}
                </span>
              </div>
              <p className="mt-1 text-xs text-parchment/60">a.n. {settings.bank_account_holder}</p>
            </Reveal>
          ) : null}

          <Reveal delay={200} className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {settings?.contact_whatsapp ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ivory px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-parchment"
              >
                Konfirmasi Donasi via WA
              </a>
            ) : null}
            <a
              href="#transparansi"
              className={
                settings?.contact_whatsapp
                  ? "border border-parchment/40 px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-parchment transition-colors hover:border-parchment hover:bg-parchment/10"
                  : "bg-ivory px-8 py-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-parchment"
              }
            >
              Bicarakan Kemitraan
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer({ settings }: { settings?: SiteSettings }) {
  const socials = [
    {
      name: "Instagram",
      url: settings?.social_instagram,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      url: settings?.social_youtube,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: settings?.social_linkedin,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      url: settings?.social_tiktok,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: settings?.social_facebook,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      url: settings?.social_x,
      icon: (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ].filter((s) => s.url && s.url.trim().length > 0);

  const waHref = settings?.contact_whatsapp
    ? `https://wa.me/${cleanWaNumber(settings.contact_whatsapp)}`
    : null;

  return (
    <footer className="border-t border-line bg-ivory">
      <div className="shell py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Kolom Profil Yayasan & Kantor */}
          <div className="lg:col-span-5">
            <Image
              src="/assets/logo.png"
              alt="Yayasan Abdi Laksata Raya"
              width={2000}
              height={2000}
              sizes="96px"
              className="h-20 w-auto object-contain object-left"
            />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Lembaga filantropi independen sejak 2016. SK Kemenkumham AHU-XXXX. Menghadirkan pendampingan berkelanjutan bagi komunitas di pelosok nusantara.
            </p>
            {settings?.office_address ? (
              <div className="mt-4 text-xs tracking-wide text-ink/70">
                <span className="eyebrow block text-muted">Wilayah Kerja</span>
                <p className="mt-1 font-medium">{settings.office_address}</p>
              </div>
            ) : null}
          </div>

          {/* Kolom Navigasi */}
          <div className="lg:col-span-3 lg:col-start-7">
            <p className="eyebrow">Navigasi</p>
            <nav className="mt-4 grid grid-cols-2 gap-y-2.5 sm:grid-cols-1" aria-label="Navigasi footer">
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

          {/* Kolom Narahubung & Sosial Media */}
          <div className="lg:col-span-3">
            <p className="eyebrow">Hubungi Kami</p>
            <div className="mt-4 space-y-2 text-sm">
              {waHref ? (
                <div>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-ink hover:text-forest"
                  >
                    <span>{settings?.contact_whatsapp}</span>
                    <span className="text-xs text-muted group-hover:text-forest">↗</span>
                  </a>
                  <span className="block text-[0.68rem] text-muted">WhatsApp Layanan & Donasi</span>
                </div>
              ) : null}

              {settings?.contact_email ? (
                <div className="pt-2">
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-ink hover:text-forest"
                  >
                    {settings.contact_email}
                  </a>
                  <span className="block text-[0.68rem] text-muted">Korespondensi & Kemitraan</span>
                </div>
              ) : null}
            </div>

            {socials.length > 0 ? (
              <div className="mt-6 pt-5 border-t border-line/60">
                <p className="eyebrow">Kanal Resmi</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {socials.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={soc.name}
                      aria-label={soc.name}
                      className="flex size-9 items-center justify-center rounded-full border border-line bg-parchment text-ink transition-colors hover:border-forest hover:bg-forest hover:text-parchment"
                    >
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="eyebrow hairline mt-16 pt-7">
          © 2026 Yayasan Abdi Laksata Raya · Semua Hak Dilindungi Undang-Undang
        </p>
      </div>
    </footer>
  );
}

