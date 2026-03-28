import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MemeGallery } from "@/components/memes/meme-gallery";

export const metadata = {
  title: "Memes — Meridian Monitor",
  description: "Geopolitische Memes aus der Community. Humor trifft Weltpolitik.",
};

export default function MemesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MemeGallery />
      </main>
      <Footer />
    </>
  );
}
