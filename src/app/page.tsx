import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Intro, AboutFoundation, ProgramList } from "@/components/site/Sections";
import { ImpactStats, StoryFeature, StoryGrid, JournalSection } from "@/components/site/Impact";
import { FounderMessage, Transparency, Partners, SupportCTA, Footer } from "@/components/site/Closing";
import {
  getDocuments,
  getHeroSlides,
  getJournal,
  getPartners,
  getPrograms,
  getStats,
  getStories,
} from "@/lib/queries";

/**
 * Halaman publik.
 *
 * Data diambil di server lewat layer query (`src/lib/queries.ts`), yang
 * otomatis jatuh ke konten statis bila Postgres belum tersedia. Setelah admin
 * menyimpan perubahan, endpoint CRUD memanggil `revalidatePath("/")` sehingga
 * halaman ini dirender ulang dengan data terbaru.
 */
export default async function Home() {
  const [heroSlides, programs, stats, stories, journal, documents, partners] = await Promise.all([
    getHeroSlides(),
    getPrograms(),
    getStats(),
    getStories(),
    getJournal(),
    getDocuments(),
    getPartners(),
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main>
        <Hero slides={heroSlides} />
        <Intro />
        <AboutFoundation />
        <ProgramList programs={programs} />
        <ImpactStats stats={stats} />
        <StoryFeature />
        <StoryGrid stories={stories} />
        <JournalSection journal={journal} />
        <FounderMessage />
        <Transparency documents={documents} />
        <Partners partners={partners} />
        <SupportCTA />
      </main>
      <Footer />
    </div>
  );
}
