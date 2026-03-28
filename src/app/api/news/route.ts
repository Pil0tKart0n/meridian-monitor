import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/news
 *
 * Returns news articles. In production, reads from database.
 * For MVP/demo, returns realistic demo data.
 *
 * Query params:
 * - category: MILITARY | DIPLOMATIC | ECONOMIC | HUMANITARIAN | NUCLEAR
 * - region: GAZA | ISRAEL | LEBANON | SYRIA | YEMEN | IRAN | RED_SEA
 * - limit: number (default 20, max 50)
 * - offset: number (default 0)
 */

interface DemoArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceCountry: string;
  category: string;
  region: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  tone: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let articles = getDemoArticles();

    if (category && category !== "all") {
      articles = articles.filter((a) => a.category === category.toUpperCase());
    }
    if (region && region !== "all") {
      articles = articles.filter((a) => a.region === region.toUpperCase());
    }

    const total = articles.length;
    const paged = articles.slice(offset, offset + limit);

    return NextResponse.json({
      data: paged,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("[API /api/news] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

function getDemoArticles(): DemoArticle[] {
  const now = new Date();

  return [
    {
      id: "1",
      title: "Iran verstaerkt Marinepraesenz in der Strasse von Hormuz",
      summary: "Die iranische Marine hat zusaetzliche Kriegsschiffe in die Strasse von Hormuz entsandt. Analysten sehen dies als Reaktion auf die juengste US-Traegergruppenverlegung in die Region.",
      source: "Reuters",
      sourceCountry: "US",
      category: "MILITARY",
      region: "IRAN",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
      tone: -4.2,
    },
    {
      id: "2",
      title: "UN Security Council calls emergency session on Gaza",
      summary: "The United Nations Security Council has convened an emergency session to address the escalating humanitarian crisis in Gaza. Multiple member states have called for an immediate ceasefire.",
      source: "Al Jazeera",
      sourceCountry: "QA",
      category: "DIPLOMATIC",
      region: "GAZA",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      tone: -2.8,
    },
    {
      id: "3",
      title: "Huthi-Milizen greifen erneut Handelsschiff im Roten Meer an",
      summary: "Jemenitische Huthi-Rebellen haben ein weiteres Frachtschiff im Roten Meer mit Drohnen angegriffen. Die Angriffe auf internationale Handelsrouten haben bereits zu einem deutlichen Anstieg der Versicherungspraemien gefuehrt.",
      source: "BBC News",
      sourceCountry: "GB",
      category: "MILITARY",
      region: "RED_SEA",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 90 * 60000).toISOString(),
      tone: -5.1,
    },
    {
      id: "4",
      title: "Oil prices surge 4% amid Red Sea shipping disruptions",
      summary: "Brent crude jumped 4.2% to $87.30 per barrel as Houthi attacks continue to disrupt Red Sea shipping lanes. Major shipping companies are rerouting vessels around the Cape of Good Hope.",
      source: "Financial Times",
      sourceCountry: "GB",
      category: "ECONOMIC",
      region: "RED_SEA",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 120 * 60000).toISOString(),
      tone: -3.5,
    },
    {
      id: "5",
      title: "IAEA: Iran enriches uranium to 60%, nearing weapons grade",
      summary: "The International Atomic Energy Agency reports that Iran has expanded its stockpile of uranium enriched to 60% purity. This level is a short technical step from the 90% needed for a nuclear weapon.",
      source: "Arms Control Association",
      sourceCountry: "US",
      category: "NUCLEAR",
      region: "IRAN",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 180 * 60000).toISOString(),
      tone: -6.0,
    },
    {
      id: "6",
      title: "Tuerkei vermittelt in Gespraechen zwischen Israel und Hamas",
      summary: "Die tuerkische Regierung hat Vermittlungsgespraeche zwischen israelischen und Hamas-Vertretern in Istanbul bestaitigt. Es ist der erste direkte Kontakt seit drei Monaten.",
      source: "Al-Monitor",
      sourceCountry: "US",
      category: "DIPLOMATIC",
      region: "ISRAEL",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 240 * 60000).toISOString(),
      tone: 1.2,
    },
    {
      id: "7",
      title: "NATO increases readiness level on eastern flank",
      summary: "NATO has raised its readiness level for forces stationed along the alliance's eastern border, citing increased Russian military activity near the Baltic states and Poland.",
      source: "Defense.gov",
      sourceCountry: "US",
      category: "MILITARY",
      region: "EUROPE",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 300 * 60000).toISOString(),
      tone: -3.8,
    },
    {
      id: "8",
      title: "Humanitaere Krise in Gaza: UNHCR warnt vor Hungersnot",
      summary: "Das UN-Fluechtlingshilfswerk warnt vor einer unmittelbar bevorstehenden Hungersnot im noerdlichen Gazastreifen. Ueber 500.000 Menschen haben keinen zuverlaessigen Zugang zu Nahrungsmitteln.",
      source: "DW News",
      sourceCountry: "DE",
      category: "HUMANITARIAN",
      region: "GAZA",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 360 * 60000).toISOString(),
      tone: -7.2,
    },
    {
      id: "9",
      title: "Hezbollah fires rockets into northern Israel",
      summary: "Hezbollah launched a barrage of rockets toward northern Israel, hitting areas near Kiryat Shmona. The IDF responded with artillery strikes on launch positions in southern Lebanon.",
      source: "Times of Israel",
      sourceCountry: "IL",
      category: "MILITARY",
      region: "LEBANON",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 420 * 60000).toISOString(),
      tone: -6.5,
    },
    {
      id: "10",
      title: "China calls for immediate ceasefire in Middle East",
      summary: "Chinese Foreign Minister Wang Yi urged all parties to exercise restraint and work toward an immediate ceasefire. China offered to host peace negotiations in Beijing.",
      source: "CGTN",
      sourceCountry: "CN",
      category: "DIPLOMATIC",
      region: "GLOBAL",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 480 * 60000).toISOString(),
      tone: 0.5,
    },
    {
      id: "11",
      title: "VIX fear index spikes as Middle East tensions escalate",
      summary: "The CBOE Volatility Index rose 18% to 24.5, its highest level in three months. Defense stocks (Lockheed Martin, Raytheon) reached all-time highs while energy stocks surged.",
      source: "Bloomberg",
      sourceCountry: "US",
      category: "ECONOMIC",
      region: "GLOBAL",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 540 * 60000).toISOString(),
      tone: -4.0,
    },
    {
      id: "12",
      title: "Syrien: Israelische Luftangriffe auf iranische Stellungen bei Damaskus",
      summary: "Die israelische Luftwaffe hat Stellungen der iranischen Revolutionsgarden nahe Damaskus bombardiert. Syrische Staatsmedien berichten von mehreren Explosionen im Suedwesten der Hauptstadt.",
      source: "Middle East Eye",
      sourceCountry: "GB",
      category: "MILITARY",
      region: "SYRIA",
      url: "#",
      imageUrl: null,
      publishedAt: new Date(now.getTime() - 600 * 60000).toISOString(),
      tone: -5.8,
    },
  ];
}
