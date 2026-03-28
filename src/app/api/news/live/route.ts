import { NextRequest, NextResponse } from "next/server";
import { fetchGdeltArticles, mapGdeltToArticle } from "@/pipeline/gdelt";
import { categorizeArticle, detectRegion, scoreEvent } from "@/pipeline/categorizer";

/**
 * GET /api/news/live
 *
 * Fetches LIVE news from GDELT API.
 * This is the real-time data endpoint — no demo data.
 *
 * Query params:
 * - limit: number (default 30, max 100)
 * - timespan: string (default "60min", options: "15min", "60min", "24hours")
 * - category: filter by category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);
    const timespan = searchParams.get("timespan") ?? "60min";
    const categoryFilter = searchParams.get("category");

    const gdeltArticles = await fetchGdeltArticles(limit, timespan);

    const articles = gdeltArticles.map((article) => {
      const mapped = mapGdeltToArticle(article);
      const category = categorizeArticle(mapped.title);
      const region = detectRegion(mapped.title);
      const score = scoreEvent(mapped.title);

      return {
        id: mapped.externalId,
        title: mapped.title,
        summary: null,
        source: mapped.source,
        sourceCountry: mapped.sourceCountry ?? "unknown",
        category,
        region: region ?? "GLOBAL",
        url: mapped.url,
        imageUrl: mapped.imageUrl,
        publishedAt: mapped.publishedAt.toISOString(),
        tone: mapped.tone ?? 0,
        geiScore: score,
      };
    });

    const filtered = categoryFilter
      ? articles.filter((a) => a.category === categoryFilter.toUpperCase())
      : articles;

    return NextResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        source: "gdelt",
        timespan,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /api/news/live] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live news" },
      { status: 500 }
    );
  }
}
