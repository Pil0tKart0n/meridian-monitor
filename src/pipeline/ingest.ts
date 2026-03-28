/**
 * Data Ingestion Pipeline
 *
 * Fetches news from RSS feeds, categorizes them,
 * scores for GEI, and stores in the database.
 */

import { PrismaClient } from "@prisma/client";
import { fetchAllRssFeeds } from "./rss";
import { categorizeArticle, detectRegion, scoreEvent } from "./categorizer";

const db = new PrismaClient();

export async function ingestRssArticles(): Promise<number> {
  console.log("[Pipeline] Fetching RSS feeds...");
  const articles = await fetchAllRssFeeds();
  console.log(`[Pipeline] Got ${articles.length} articles from RSS feeds`);

  let inserted = 0;

  for (const article of articles) {
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
      // Skip duplicates and invalid articles silently
      if (error instanceof Error && !error.message.includes("Unique constraint")) {
        console.error(`[Pipeline] Error inserting article: ${article.title}`, error);
      }
    }
  }

  console.log(`[Pipeline] Inserted ${inserted} new articles`);
  return inserted;
}

export async function saveGeiSnapshot(): Promise<void> {
  const { calculateGeiFromArticles } = await import("./gei-calculator");

  // Get articles from last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const articles = await db.newsArticle.findMany({
    where: {
      publishedAt: { gte: ninetyDaysAgo },
      category: { not: "UNCATEGORIZED" },
    },
    select: {
      category: true,
      geiScore: true,
      publishedAt: true,
    },
  });

  const gei = calculateGeiFromArticles(
    articles.map((a) => ({
      category: a.category,
      score: a.geiScore,
      eventDate: a.publishedAt,
    }))
  );

  await db.escalationSnapshot.create({
    data: {
      overallScore: gei.overallScore,
      militaryScore: gei.militaryScore,
      diplomaticScore: gei.diplomaticScore,
      conflictScore: gei.conflictScore,
      economicScore: gei.economicScore,
      nuclearScore: gei.nuclearScore,
      primaryDriver: gei.primaryDriver,
    },
  });

  console.log(`[Pipeline] GEI snapshot saved: ${gei.overallScore}/100 (${gei.primaryDriver})`);
}

export async function runPipeline(): Promise<void> {
  console.log("[Pipeline] Starting ingestion...");
  const start = Date.now();

  await ingestRssArticles();
  await saveGeiSnapshot();

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[Pipeline] Done in ${duration}s`);

  await db.$disconnect();
}

// Run if called directly
if (require.main === module) {
  runPipeline().catch(console.error);
}
