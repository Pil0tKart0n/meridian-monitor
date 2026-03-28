import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batchSummarize } from "@/pipeline/summarizer";

/**
 * POST /api/pipeline/summarize
 *
 * Summarizes articles that don't have GPT summaries yet.
 * Uses OpenAI GPT-4o-mini for cost-efficient summarization.
 *
 * Query params:
 * - limit: number of articles to summarize (default 20, max 50)
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    // Find articles without proper summaries (HTML or null)
    const articles = await db.newsArticle.findMany({
      where: {
        OR: [
          { summary: null },
          { summary: { contains: "<" } }, // HTML content
          { summary: "" },
        ],
      },
      select: { id: true, title: true, summary: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    if (articles.length === 0) {
      return NextResponse.json({
        data: { summarized: 0, message: "All articles already have summaries" },
      });
    }

    console.log(`[Summarize] Processing ${articles.length} articles...`);
    const results = await batchSummarize(articles);

    // Update articles in DB
    let updated = 0;
    for (const [id, result] of results) {
      await db.newsArticle.update({
        where: { id },
        data: {
          summary: result.summary,
          category: result.category,
          region: result.region,
          geiScore: result.geiScore,
        },
      });
      updated++;
    }

    return NextResponse.json({
      data: {
        processed: articles.length,
        summarized: updated,
        failed: articles.length - updated,
      },
    });
  } catch (error) {
    console.error("[Summarize API] Error:", error);
    return NextResponse.json(
      { error: "Summarization failed", details: String(error) },
      { status: 500 }
    );
  }
}
