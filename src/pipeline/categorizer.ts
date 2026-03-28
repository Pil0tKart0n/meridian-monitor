/**
 * Event Categorizer
 *
 * Classifies news articles into categories and regions based on keyword matching.
 * For MVP — later replaced by GPT-powered classification.
 */

type EventCategory = "MILITARY" | "DIPLOMATIC" | "ECONOMIC" | "HUMANITARIAN" | "NUCLEAR" | "CYBER" | "UNCATEGORIZED";
type ConflictRegion = "GAZA" | "ISRAEL" | "LEBANON" | "SYRIA" | "YEMEN" | "IRAN" | "IRAQ" | "RED_SEA" | "GULF" | "EUROPE" | "GLOBAL";

const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  MILITARY: [
    "military", "troops", "soldier", "army", "navy", "air force",
    "airstrike", "bombing", "missile", "rocket", "drone", "artillery",
    "offensive", "invasion", "deployment", "defense", "combat",
    "attack", "strike", "operation", "forces", "weapons",
    "Luftangriff", "Rakete", "Drohne", "Militaer", "Armee", "Truppen",
    "Angriff", "Offensive", "Verteidigung",
  ],
  DIPLOMATIC: [
    "diplomat", "embassy", "ambassador", "negotiate", "treaty",
    "ceasefire", "peace talks", "summit", "UN", "Security Council",
    "resolution", "sanctions", "agreement", "alliance", "NATO",
    "mediation", "bilateral", "multilateral",
    "Diplomatie", "Verhandlung", "Waffenstillstand", "Friedensgespraeche",
    "Sanktionen", "Resolution",
  ],
  ECONOMIC: [
    "oil price", "energy", "trade", "sanctions", "economy",
    "market", "stock", "inflation", "supply chain", "shipping",
    "Suez", "commodity", "currency", "investment",
    "Oelpreis", "Handel", "Wirtschaft", "Lieferkette", "Boerse",
  ],
  HUMANITARIAN: [
    "civilian", "humanitarian", "refugee", "aid", "UNHCR",
    "displacement", "casualt", "hospital", "school", "shelter",
    "food", "water", "crisis", "evacuation",
    "Fluechtling", "humanitaer", "Hilfe", "Krise", "Zivilisten",
  ],
  NUCLEAR: [
    "nuclear", "atomic", "uranium", "enrichment", "IAEA",
    "warhead", "ICBM", "ballistic", "strategic", "deterrence",
    "nonproliferation", "arms control",
    "Atom", "nuklear", "Uran", "Anreicherung", "Sprengkopf",
  ],
  CYBER: [
    "cyber", "hack", "malware", "ransomware", "infrastructure",
    "cyberattack", "digital", "information warfare",
    "Cyberangriff", "Hacker",
  ],
  UNCATEGORIZED: [],
};

const REGION_KEYWORDS: Record<ConflictRegion, string[]> = {
  GAZA: ["Gaza", "Palestinian", "West Bank", "Palaestina", "Westjordanland"],
  ISRAEL: ["Israel", "IDF", "Tel Aviv", "Jerusalem", "Netanyahu", "Knesset"],
  LEBANON: ["Lebanon", "Hezbollah", "Hisbollah", "Beirut", "Libanon"],
  SYRIA: ["Syria", "Assad", "Damascus", "Syrien", "Damaskus"],
  YEMEN: ["Yemen", "Houthi", "Huthi", "Sanaa", "Jemen", "Aden"],
  IRAN: ["Iran", "Tehran", "Teheran", "IRGC", "Khamenei", "Raisi"],
  IRAQ: ["Iraq", "Baghdad", "Irak", "Bagdad"],
  RED_SEA: ["Red Sea", "Rotes Meer", "Bab el-Mandeb", "Gulf of Aden"],
  GULF: ["Persian Gulf", "Strait of Hormuz", "Hormuz", "Gulf states", "Golfstaaten"],
  EUROPE: ["NATO", "Europe", "Europa", "EU", "Brussels", "Bruessel"],
  GLOBAL: [],
};

export function categorizeArticle(title: string, summary?: string | null): EventCategory {
  const text = `${title} ${summary ?? ""}`.toLowerCase();

  let bestCategory: EventCategory = "UNCATEGORIZED";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "UNCATEGORIZED") continue;
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as EventCategory;
    }
  }

  return bestCategory;
}

export function detectRegion(title: string, summary?: string | null): ConflictRegion | null {
  const text = `${title} ${summary ?? ""}`;

  let bestRegion: ConflictRegion | null = null;
  let bestScore = 0;

  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (region === "GLOBAL") continue;
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestRegion = region as ConflictRegion;
    }
  }

  return bestRegion;
}

/**
 * Score an event for the GEI on a scale of -10 to +10
 */
export function scoreEvent(title: string, summary?: string | null): number {
  const text = `${title} ${summary ?? ""}`.toLowerCase();

  let score = 0;

  // Strong escalation signals (+5 to +8)
  const strongEscalation = [
    "invasion", "nuclear test", "missile launch", "mobilization",
    "declaration of war", "blockade", "no-fly zone",
  ];
  for (const signal of strongEscalation) {
    if (text.includes(signal)) score += 6;
  }

  // Moderate escalation (+2 to +4)
  const moderateEscalation = [
    "airstrike", "air strike", "bombing", "shelling", "killed",
    "troops deployed", "sanctions imposed", "ambassador recalled",
    "military exercise", "weapons test", "drone attack",
  ];
  for (const signal of moderateEscalation) {
    if (text.includes(signal)) score += 3;
  }

  // Mild escalation (+1 to +2)
  const mildEscalation = [
    "tensions", "warning", "threat", "escalat", "provocat",
    "hostile", "condemn", "retaliat",
  ];
  for (const signal of mildEscalation) {
    if (text.includes(signal)) score += 1;
  }

  // De-escalation signals (-2 to -5)
  const deescalation = [
    "ceasefire", "peace talks", "agreement signed", "treaty",
    "humanitarian corridor", "prisoner exchange", "de-escalat",
    "negotiations resumed", "sanctions eased", "troops withdraw",
  ];
  for (const signal of deescalation) {
    if (text.includes(signal)) score -= 3;
  }

  // Clamp to -10 to +10
  return Math.max(-10, Math.min(10, score));
}
