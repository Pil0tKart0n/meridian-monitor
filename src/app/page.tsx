import { Header } from "@/components/layout/header";
import { LiveFeed } from "@/components/feed/live-feed";
import { SidebarTrending } from "@/components/feed/sidebar-trending";
import { LiveEscalationGauge } from "@/components/gei/live-escalation-gauge";
import { BreakingTicker } from "@/components/news/breaking-ticker";

export default function HomePage() {
  return (
    <>
      <Header />
      <BreakingTicker />
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Left sidebar — GEI + Nav (hidden on mobile) */}
          <aside className="hidden lg:block lg:col-span-3 border-r border-zinc-800 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-4">
              <LiveEscalationGauge compact />

              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Updates</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { time: "12:34", text: "IRGC-Boote stoppen Containerschiff", color: "text-red-400" },
                    { time: "12:12", text: "Hisbollah-Raketen auf Kiryat Shmona", color: "text-red-400" },
                    { time: "11:45", text: "Brent Crude +3.2% ($89.40)", color: "text-amber-400" },
                    { time: "11:20", text: "UN-Sicherheitsrat einberufen", color: "text-blue-400" },
                    { time: "10:58", text: "IDF Luftschlag bei Damaskus", color: "text-orange-400" },
                    { time: "10:30", text: "Huthi-Drohne ueber Rotem Meer", color: "text-red-400" },
                  ].map((item) => (
                    <div key={item.time} className="flex items-start gap-2">
                      <span className="text-[10px] text-zinc-700 font-mono tabular-nums shrink-0 mt-0.5">{item.time}</span>
                      <p className={`text-xs leading-snug ${item.color}`}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main feed — center */}
          <main className="lg:col-span-6 border-r border-zinc-800 min-h-screen">
            <LiveFeed />
          </main>

          {/* Right sidebar — Trending (hidden on mobile/tablet) */}
          <aside className="hidden lg:block lg:col-span-3 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <SidebarTrending />
          </aside>
        </div>
      </div>
    </>
  );
}
