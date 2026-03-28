import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePipelineAuth } from "@/lib/admin-auth";
import { batchSummarize } from "@/pipeline/summarizer";

/**
 * POST /api/pipeline/summarize
 *
 * Summarizes articles without GPT summaries.
 * Requires: Authorization: Bearer <PIPELINE_SECRET>
 */
export async function POST(request: NextRequest) {
  const authError = requirePipelineAuth(request);
  if (authError) return authError;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = request.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const articles = await db.newsArticle.findMany({
      where: {
        OR: [
          { summary: null },
          { summary: { contains: "<" } },
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
      data: { processed: articles.length, summarized: updated, failed: articles.length - updated },
    });
  } catch (error) {
    console.error("[Summarize API] Error:", error);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
