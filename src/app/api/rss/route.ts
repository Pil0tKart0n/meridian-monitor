import { NextResponse } from "next/server";
import { fetchAllRssFeeds } from "@/pipeline/rss";
import { categorizeArticle, detectRegion } from "@/pipeline/categorizer";

/**
 * GET /api/rss
 *
 * Fetches news from all configured RSS feeds.
 * Returns categorized and region-tagged articles.
 */
export async function GET() {
  try {
    const rawArticles = await fetchAllRssFeeds();

    const articles = rawArticles.slice(0, 50).map((article, i) => ({
      id: `rss-${i}-${Date.now()}`,
      title: article.title,
      summary: article.summary,
      source: article.source,
      sourceCountry: article.sourceCountry,
      category: categorizeArticle(article.title, article.summary),
      region: detectRegion(article.title, article.summary) ?? "GLOBAL",
      url: article.url,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt.toISOString(),
      perspective: article.perspective,
    }));

    return NextResponse.json({
      data: articles,
      meta: {
        total: articles.length,
        source: "rss",
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /api/rss] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSS feeds" },
      { status: 500 }
    );
  }
}
