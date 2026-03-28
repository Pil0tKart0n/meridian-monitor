/**
 * RSS Feed Aggregator
 *
 * Fetches news from 30+ international sources via RSS feeds.
 * Categorized by region and media perspective.
 */

interface RssSource {
  name: string;
  url: string;
  country: string;
  perspective: "western" | "arab" | "israeli" | "russian" | "chinese" | "international";
}

export const RSS_SOURCES: RssSource[] = [
  // Western Media
  { name: "Reuters World", url: "https://feeds.reuters.com/reuters/worldNews", country: "US", perspective: "western" },
  { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", country: "GB", perspective: "western" },
  { name: "The Guardian World", url: "https://www.theguardian.com/world/rss", country: "GB", perspective: "western" },
  { name: "DW News", url: "https://rss.dw.com/xml/rss-en-world", country: "DE", perspective: "western" },
  { name: "France 24", url: "https://www.france24.com/en/middle-east/rss", country: "FR", perspective: "western" },

  // Arab Media
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", country: "QA", perspective: "arab" },
  { name: "Al Arabiya", url: "https://english.alarabiya.net/tools/rss", country: "SA", perspective: "arab" },
  { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss", country: "GB", perspective: "arab" },
  { name: "Al-Monitor", url: "https://www.al-monitor.com/rss", country: "US", perspective: "arab" },

  // Israeli Media
  { name: "Times of Israel", url: "https://www.timesofisrael.com/feed/", country: "IL", perspective: "israeli" },
  { name: "i24NEWS", url: "https://www.i24news.tv/en/rss", country: "IL", perspective: "israeli" },
  { name: "Jerusalem Post", url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx", country: "IL", perspective: "israeli" },

  // Think Tanks & Analysis
  { name: "Crisis Group", url: "https://www.crisisgroup.org/rss.xml", country: "INT", perspective: "international" },
  { name: "Brookings", url: "https://www.brookings.edu/feed/", country: "US", perspective: "international" },
  { name: "CSIS", url: "https://www.csis.org/rss.xml", country: "US", perspective: "international" },
  { name: "War on the Rocks", url: "https://warontherocks.com/feed/", country: "US", perspective: "western" },
  { name: "The War Zone", url: "https://www.thedrive.com/the-war-zone/feed", country: "US", perspective: "western" },

  // Nuclear / Arms Control
  { name: "Arms Control", url: "https://www.armscontrol.org/rss.xml", country: "US", perspective: "international" },
  { name: "Bulletin of Atomic Scientists", url: "https://thebulletin.org/feed/", country: "US", perspective: "international" },

  // Defense
  { name: "Defense.gov", url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx", country: "US", perspective: "western" },
];

interface ParsedRssItem {
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  source: string;
  sourceCountry: string;
  perspective: string;
}

export async function fetchRssFeed(source: RssSource): Promise<ParsedRssItem[]> {
  try {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "MeridianMonitor/1.0 (news aggregator)",
      },
    });

    if (!response.ok) {
      console.error(`[RSS] ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRssXml(xml);

    return items.map((item) => ({
      ...item,
      source: source.name,
      sourceCountry: source.country,
      perspective: source.perspective,
    }));
  } catch (error) {
    console.error(`[RSS] ${source.name}: fetch error`, error);
    return [];
  }
}

function parseRssXml(xml: string): Omit<ParsedRssItem, "source" | "sourceCountry" | "perspective">[] {
  const items: Omit<ParsedRssItem, "source" | "sourceCountry" | "perspective">[] = [];

  // Simple XML parser for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = extractTag(itemXml, "description");
    const pubDate = extractTag(itemXml, "pubDate");
    const enclosure = extractAttribute(itemXml, "enclosure", "url");
    const mediaContent = extractAttribute(itemXml, "media:content", "url");

    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        url: link,
        summary: description ? decodeHtmlEntities(stripHtml(description)).slice(0, 500) : null,
        imageUrl: enclosure || mediaContent || null,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function fetchAllRssFeeds(): Promise<ParsedRssItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchRssFeed(source))
  );

  const articles: ParsedRssItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  // Sort by date, newest first
  articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return articles;
}
