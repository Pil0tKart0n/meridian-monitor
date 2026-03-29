import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MemeGallery } from "@/components/memes/meme-gallery";
import { TelegramChannels } from "@/components/telegram/telegram-channels";

export const metadata = {
  title: "Memes & Telegram — Meridian Monitor",
  description: "Geopolitische Memes aus der Community und kuratierte Telegram-Kanaele mit Frontberichten.",
};

export default function MemesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
        {/* Meme Gallery */}
        <MemeGallery />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-950 px-4 text-xs text-zinc-600 uppercase tracking-widest">
              Telegram Frontline
            </span>
          </div>
        </div>

        {/* Telegram Channels */}
        <TelegramChannels />
      </main>
      <Footer />
    </>
  );
}
