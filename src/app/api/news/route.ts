import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/news
 *
 * Returns news articles from database.
 * Falls back to demo data if DB is empty.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    // Try database first
    const dbCount = await db.newsArticle.count();

    if (dbCount > 0) {
      const where: Record<string, unknown> = {};
      if (category && category !== "all") where.category = category.toUpperCase();
      if (region && region !== "all") where.region = region.toUpperCase();

      const [articles, total] = await Promise.all([
        db.newsArticle.findMany({
          where,
          orderBy: { publishedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        db.newsArticle.count({ where }),
      ]);

      return NextResponse.json({
        data: articles.map((a: {
          id: string; title: string; summary: string | null; source: string;
          sourceCountry: string | null; category: string; region: string | null;
          url: string; imageUrl: string | null; publishedAt: Date;
          tone: number | null; geiScore: number;
        }) => ({
          id: a.id,
          title: a.title,
          summary: a.summary ?? "",
          source: a.source,
          sourceCountry: a.sourceCountry ?? "unknown",
          category: a.category,
          region: a.region ?? "GLOBAL",
          url: a.url,
          imageUrl: a.imageUrl,
          publishedAt: a.publishedAt.toISOString(),
          tone: a.tone ?? 0,
        })),
        meta: { total, limit, offset, hasMore: offset + limit < total, source: "database" },
      });
    }

    // Fallback to demo data
    return NextResponse.json({
      data: getDemoArticles(category, region).slice(offset, offset + limit),
      meta: { total: 12, limit, offset, hasMore: false, source: "demo" },
    });
  } catch (error) {
    console.error("[API /api/news] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

function getDemoArticles(category: string | null, region: string | null) {
  const now = new Date();
  const articles = [
    { id: "1", title: "Iran verstaerkt Marinepraesenz in der Strasse von Hormuz", summary: "Die iranische Marine hat zusaetzliche Kriegsschiffe in die Strasse von Hormuz entsandt.", source: "Reuters", sourceCountry: "US", category: "MILITARY", region: "IRAN", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 30 * 60000).toISOString(), tone: -4.2 },
    { id: "2", title: "UN Security Council calls emergency session on Gaza", summary: "The United Nations Security Council has convened an emergency session to address the humanitarian crisis in Gaza.", source: "Al Jazeera", sourceCountry: "QA", category: "DIPLOMATIC", region: "GAZA", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 45 * 60000).toISOString(), tone: -2.8 },
    { id: "3", title: "Huthi-Milizen greifen erneut Handelsschiff im Roten Meer an", summary: "Jemenitische Huthi-Rebellen haben ein weiteres Frachtschiff im Roten Meer mit Drohnen angegriffen.", source: "BBC News", sourceCountry: "GB", category: "MILITARY", region: "RED_SEA", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 90 * 60000).toISOString(), tone: -5.1 },
    { id: "4", title: "Oil prices surge 4% amid Red Sea shipping disruptions", summary: "Brent crude jumped 4.2% to $87.30 per barrel as Houthi attacks continue to disrupt Red Sea shipping lanes.", source: "Financial Times", sourceCountry: "GB", category: "ECONOMIC", region: "RED_SEA", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 120 * 60000).toISOString(), tone: -3.5 },
    { id: "5", title: "IAEA: Iran enriches uranium to 60%, nearing weapons grade", summary: "Iran has expanded its stockpile of uranium enriched to 60% purity.", source: "Arms Control Association", sourceCountry: "US", category: "NUCLEAR", region: "IRAN", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 180 * 60000).toISOString(), tone: -6.0 },
    { id: "6", title: "Tuerkei vermittelt in Gespraechen zwischen Israel und Hamas", summary: "Die tuerkische Regierung hat Vermittlungsgespraeche zwischen israelischen und Hamas-Vertretern in Istanbul bestaitigt.", source: "Al-Monitor", sourceCountry: "US", category: "DIPLOMATIC", region: "ISRAEL", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 240 * 60000).toISOString(), tone: 1.2 },
    { id: "7", title: "NATO increases readiness level on eastern flank", summary: "NATO has raised its readiness level for forces stationed along the alliance's eastern border.", source: "Defense.gov", sourceCountry: "US", category: "MILITARY", region: "EUROPE", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 300 * 60000).toISOString(), tone: -3.8 },
    { id: "8", title: "Humanitaere Krise in Gaza: UNHCR warnt vor Hungersnot", summary: "Das UN-Fluechtlingshilfswerk warnt vor einer unmittelbar bevorstehenden Hungersnot im noerdlichen Gazastreifen.", source: "DW News", sourceCountry: "DE", category: "HUMANITARIAN", region: "GAZA", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 360 * 60000).toISOString(), tone: -7.2 },
    { id: "9", title: "Hezbollah fires rockets into northern Israel", summary: "Hezbollah launched a barrage of rockets toward northern Israel.", source: "Times of Israel", sourceCountry: "IL", category: "MILITARY", region: "LEBANON", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 420 * 60000).toISOString(), tone: -6.5 },
    { id: "10", title: "China calls for immediate ceasefire in Middle East", summary: "Chinese Foreign Minister urged all parties to exercise restraint.", source: "CGTN", sourceCountry: "CN", category: "DIPLOMATIC", region: "GLOBAL", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 480 * 60000).toISOString(), tone: 0.5 },
    { id: "11", title: "VIX fear index spikes as Middle East tensions escalate", summary: "The CBOE Volatility Index rose 18% to 24.5, its highest level in three months.", source: "Bloomberg", sourceCountry: "US", category: "ECONOMIC", region: "GLOBAL", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 540 * 60000).toISOString(), tone: -4.0 },
    { id: "12", title: "Syrien: Israelische Luftangriffe auf iranische Stellungen bei Damaskus", summary: "Die israelische Luftwaffe hat Stellungen der iranischen Revolutionsgarden nahe Damaskus bombardiert.", source: "Middle East Eye", sourceCountry: "GB", category: "MILITARY", region: "SYRIA", url: "#", imageUrl: null, publishedAt: new Date(now.getTime() - 600 * 60000).toISOString(), tone: -5.8 },
  ];

  let filtered = articles;
  if (category && category !== "all") filtered = filtered.filter((a) => a.category === category.toUpperCase());
  if (region && region !== "all") filtered = filtered.filter((a) => a.region === region.toUpperCase());
  return filtered;
}
