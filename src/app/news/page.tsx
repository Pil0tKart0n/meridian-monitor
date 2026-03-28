import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata = {
  title: "Nachrichten — Meridian Monitor",
  description: "Aktuelle geopolitische Nachrichten aus 30+ internationalen Quellen. Echtzeit-Updates zu Nahostkonflikt, Eskalationsrisiken und globalen Auswirkungen.",
};

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NewsFeed />
      </main>
      <Footer />
    </>
  );
}
