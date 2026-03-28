/**
 * GPT-powered Article Summarizer
 *
 * Uses OpenAI GPT-4o-mini to:
 * 1. Summarize articles to 2-3 sentences in German
 * 2. Improve event categorization
 * 3. Extract key entities and regions
 *
 * Cost-optimized: uses gpt-4o-mini (~$0.15 per 1M input tokens)
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SummarizationResult {
  summary: string;
  category: string;
  region: string | null;
  geiScore: number;
  keyEntities: string[];
}

const SYSTEM_PROMPT = `Du bist ein geopolitischer Nachrichtenanalyst fuer Meridian Monitor, eine Intelligence-Plattform.

Deine Aufgabe: Analysiere den Nachrichtenartikel und liefere:
1. Eine praegnante Zusammenfassung (2-3 Saetze, Deutsch)
2. Kategorie: MILITARY, DIPLOMATIC, ECONOMIC, HUMANITARIAN, NUCLEAR, CYBER oder UNCATEGORIZED
3. Region: GAZA, ISRAEL, LEBANON, SYRIA, YEMEN, IRAN, IRAQ, RED_SEA, GULF, EUROPE, GLOBAL oder null
4. GEI-Score: -10 (starke Deeskalation) bis +10 (schwere Eskalation)
5. Key Entities: Wichtigste Akteure/Orte (max 5)

Antworte NUR als JSON:
{"summary":"...","category":"...","region":"...","geiScore":0,"keyEntities":["..."]}`;

export async function summarizeArticle(
  title: string,
  content?: string | null
): Promise<SummarizationResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const userMessage = content
      ? `Titel: ${title}\n\nInhalt: ${content.slice(0, 2000)}`
      : `Titel: ${title}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text) as SummarizationResult;

    // Validate
    const validCategories = ["MILITARY", "DIPLOMATIC", "ECONOMIC", "HUMANITARIAN", "NUCLEAR", "CYBER", "UNCATEGORIZED"];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = "UNCATEGORIZED";
    }

    parsed.geiScore = Math.max(-10, Math.min(10, parsed.geiScore));

    return parsed;
  } catch (error) {
    console.error("[Summarizer] Error:", error);
    return null;
  }
}

/**
 * Batch summarize multiple articles with rate limiting.
 * Processes max 5 concurrently to stay within OpenAI rate limits.
 */
export async function batchSummarize(
  articles: Array<{ id: string; title: string; summary: string | null }>
): Promise<Map<string, SummarizationResult>> {
  const results = new Map<string, SummarizationResult>();
  const batchSize = 5;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (article) => {
        const result = await summarizeArticle(article.title, article.summary);
        if (result) {
          results.set(article.id, result);
        }
      })
    );

    // Log failures
    for (const result of batchResults) {
      if (result.status === "rejected") {
        console.error("[Summarizer] Batch error:", result.reason);
      }
    }

    // Small delay between batches to respect rate limits
    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`[Summarizer] Summarized ${results.size}/${articles.length} articles`);
  return results;
}
