import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePipelineAuth } from "@/lib/admin-auth";
import { fetchAllRssFeeds } from "@/pipeline/rss";
import { categorizeArticle, detectRegion, scoreEvent } from "@/pipeline/categorizer";
import { calculateGeiFromArticles } from "@/pipeline/gei-calculator";

/**
 * POST /api/pipeline
 *
 * Triggers the data ingestion pipeline.
 * Requires: Authorization: Bearer <PIPELINE_SECRET>
 */
export async function POST(request: NextRequest) {
  const authError = requirePipelineAuth(request);
  if (authError) return authError;

  try {
    const start = Date.now();

    const rawArticles = await fetchAllRssFeeds();

    let inserted = 0;
    for (const article of rawArticles) {
      try {
        const category = categorizeArticle(article.title, article.summary);
        const region = detectRegion(article.title, article.summary);
        const geiScore = scoreEvent(article.title, article.summary);

        await db.newsArticle.upsert({
          where: { url: article.url },
          update: {},
          create: {
            title: article.title,
            summary: article.summary,
            url: article.url,
            imageUrl: article.imageUrl,
            source: article.source,
            sourceCountry: article.sourceCountry,
            category,
            region,
            tone: 0,
            geiScore,
            publishedAt: article.publishedAt,
            language: "en",
          },
        });
        inserted++;
      } catch (error) {
        if (error instanceof Error && !error.message.includes("Unique constraint")) {
          console.error("[Pipeline] Insert error:", error.message);
        }
      }
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const scoredArticles = await db.newsArticle.findMany({
      where: { publishedAt: { gte: ninetyDaysAgo }, category: { not: "UNCATEGORIZED" } },
      select: { category: true, geiScore: true, publishedAt: true },
    });

    const gei = calculateGeiFromArticles(
      scoredArticles.map((a: { category: string; geiScore: number; publishedAt: Date }) => ({
        category: a.category, score: a.geiScore, eventDate: a.publishedAt,
      }))
    );

    await db.escalationSnapshot.create({
      data: {
        overallScore: gei.overallScore, militaryScore: gei.militaryScore,
        diplomaticScore: gei.diplomaticScore, conflictScore: gei.conflictScore,
        economicScore: gei.economicScore, nuclearScore: gei.nuclearScore,
        primaryDriver: gei.primaryDriver,
      },
    });

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    return NextResponse.json({
      data: {
        articlesFound: rawArticles.length, articlesInserted: inserted,
        geiScore: gei.overallScore,
        geiLevel: gei.overallScore >= 81 ? "critical" : gei.overallScore >= 61 ? "severe" : gei.overallScore >= 41 ? "high" : gei.overallScore >= 21 ? "elevated" : "low",
        primaryDriver: gei.primaryDriver, durationSeconds: parseFloat(duration),
      },
    });
  } catch (error) {
    console.error("[Pipeline] Error:", error);
    return NextResponse.json({ error: "Pipeline execution failed" }, { status: 500 });
  }
}

/**
 * GET /api/pipeline — Pipeline status (public, read-only)
 */
export async function GET() {
  try {
    const [articleCount, latestSnapshot] = await Promise.all([
      db.newsArticle.count(),
      db.escalationSnapshot.findFirst({ orderBy: { timestamp: "desc" } }),
    ]);

    return NextResponse.json({
      data: {
        articleCount,
        latestSnapshot: latestSnapshot ? {
          score: Math.round(latestSnapshot.overallScore),
          primaryDriver: latestSnapshot.primaryDriver,
          timestamp: latestSnapshot.timestamp.toISOString(),
        } : null,
      },
    });
  } catch (error) {
    console.error("[Pipeline Status] Error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
