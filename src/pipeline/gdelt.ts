/**
 * GDELT DOC API Integration
 *
 * Fetches news articles from GDELT's DOC API filtered by Middle East conflict keywords.
 * Updates every 15 minutes via cron job.
 *
 * API Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-exploring-the-worlds-news-fulltext-api/
 */

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

const CONFLICT_KEYWORDS = [
  "Gaza", "Hamas", "Hezbollah", "Hisbollah", "Iran Israel",
  "Yemen Houthi", "Red Sea attack", "Suez Canal",
  "Syria conflict", "Lebanon border",
  "nuclear Iran", "IAEA Iran",
  "NATO Russia", "Ukraine",
  "military escalation", "missile strike",
  "drone attack", "ceasefire",
  "UN Security Council", "sanctions",
  "oil price conflict", "Strait of Hormuz",
].join(" OR ");

interface GdeltArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

interface GdeltResponse {
  articles: GdeltArticle[];
}

export async function fetchGdeltArticles(
  maxRecords = 50,
  timespan = "15min"
): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query: CONFLICT_KEYWORDS,
    mode: "ArtList",
    maxrecords: String(maxRecords),
    timespan: timespan,
    format: "json",
    sort: "DateDesc",
  });

  const url = `${GDELT_DOC_API}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`[GDELT] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: GdeltResponse = await response.json();
    return data.articles ?? [];
  } catch (error) {
    console.error("[GDELT] Fetch error:", error);
    return [];
  }
}

export function mapGdeltToArticle(article: GdeltArticle) {
  return {
    externalId: `gdelt-${Buffer.from(article.url).toString("base64url").slice(0, 50)}`,
    title: article.title,
    url: article.url,
    imageUrl: article.socialimage || null,
    source: article.domain,
    sourceCountry: article.sourcecountry || null,
    tone: article.tone,
    publishedAt: parseGdeltDate(article.seendate),
    language: article.language?.toLowerCase() || "en",
  };
}

function parseGdeltDate(dateStr: string): Date {
  // GDELT format: YYYYMMDDHHmmSS
  if (dateStr.length >= 14) {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10);
    const min = dateStr.slice(10, 12);
    const sec = dateStr.slice(12, 14);
    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
  }
  return new Date(dateStr);
}
