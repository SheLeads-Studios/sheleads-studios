// Deterministic fake social scan — seeded off the handle so the same handle
// always produces the same plausible-looking metrics.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seed: number, arr: readonly T[]): T {
  return arr[seed % arr.length];
}

const TOPICS = [
  "training", "recovery", "travel", "mindset", "team", "race day",
  "gym life", "behind the scenes", "community", "sustainability",
  "food", "fashion", "mental health", "rest days",
] as const;

export type FakeScanResult = {
  followers: number;
  engagement_rate: number;
  top_topics: string[];
  audience_age: string;
  audience_belgium_pct: number;
  audience_female_pct: number;
  audience_hints: string[];
};

export function fakeScan(platform: string, handle: string): FakeScanResult {
  const clean = handle.replace(/^@/, "").toLowerCase().trim();
  const seed = hash(`${platform}:${clean}`);

  const base = 400 + (seed % 28000);
  const multiplier =
    platform === "tiktok" ? 3.2 : platform === "youtube" ? 0.7 : 1.0;
  const followers = Math.round(base * multiplier);

  const engagement = 2.3 + ((seed >> 3) % 70) / 10; // 2.3% – 9.3%

  const topics = [
    pick(seed, TOPICS),
    pick(seed >> 5, TOPICS),
    pick(seed >> 9, TOPICS),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const ageBuckets = ["18–24", "18–28", "22–34", "25–40"];
  const audience_age = pick(seed >> 4, ageBuckets);

  const belgiumPct = 45 + ((seed >> 7) % 40); // 45–85
  const femalePct = 58 + ((seed >> 11) % 32); // 58–90

  const audience_hints: string[] = [];
  if (belgiumPct >= 55) audience_hints.push("belgium_first");
  if (audience_age.startsWith("18")) audience_hints.push("women_18_28");
  else if (audience_age.startsWith("2")) audience_hints.push("women_20_35");
  else audience_hints.push("women_25_45");

  return {
    followers,
    engagement_rate: Math.round(engagement * 10) / 10,
    top_topics: topics,
    audience_age,
    audience_belgium_pct: belgiumPct,
    audience_female_pct: femalePct,
    audience_hints,
  };
}
