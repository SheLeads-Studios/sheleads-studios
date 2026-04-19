export type Brand = {
  id: number;
  name: string;
  category: string;
  photo_url: string | null;
  tagline: string | null;
  values_tags: string[];
  audience_fit: string[];
  sport_affinity: string[];
  size: string | null;
  city: string | null;
};

export type MatchInput = {
  likedValueTags: string[];        // from value_responses with response='agree'
  likedBrands: Brand[];            // from swipes (target_type='brand', direction='like')
  sports: string[];                // athlete_sports.sport lowercased
  audienceHints: string[];         // from social scan stub
};

export type MatchResult = {
  brand: Brand;
  score: number;
  reasonTags: string[];
  reason: string;
};

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function sportOverlap(userSports: string[], brandAffinity: string[]): number {
  if (userSports.length === 0 || brandAffinity.length === 0) return 0;
  const aff = new Set(brandAffinity.map((s) => s.toLowerCase()));
  if (aff.has("multi_sport")) return 0.5;
  const mapped = userSports.map(mapSportToAffinity);
  for (const m of mapped) if (aff.has(m)) return 1;
  return 0;
}

function mapSportToAffinity(sport: string): string {
  const s = sport.toLowerCase();
  if (/cycling|road|mountain bik/.test(s)) return "cycling";
  if (/run|marathon|trail/.test(s)) return "running";
  if (/climb|boulder/.test(s)) return "climbing";
  if (/yoga|pilates/.test(s)) return "yoga";
  if (/box|mma|kick/.test(s)) return "combat";
  if (/skate|bmx/.test(s)) return "skate";
  if (/swim|triathlon/.test(s)) return "endurance";
  if (/strength|crossfit|lift/.test(s)) return "strength";
  return "multi_sport";
}

const TAG_LABELS: Record<string, string> = {
  mental_health: "mental health",
  values_first: "values-led partnerships",
  role_model: "being a role model",
  sustainability: "sustainability",
  content_creator: "creating content",
  elite_ambition: "high ambition",
  equality: "equality for women in sport",
  body_autonomy: "body autonomy",
  community: "community over glory",
  activism: "speaking up on social issues",
};

function labelTag(tag: string): string {
  return TAG_LABELS[tag] ?? tag.replace(/_/g, " ");
}

export function scoreBrands(
  brands: Brand[],
  input: MatchInput
): MatchResult[] {
  const results = brands.map<MatchResult>((brand) => {
    const likedBrandTagPool = input.likedBrands.flatMap((b) => b.values_tags);
    const valuesScore = jaccard(input.likedValueTags, brand.values_tags);
    const brandTagScore = jaccard(likedBrandTagPool, brand.values_tags);
    const sportScore = sportOverlap(input.sports, brand.sport_affinity);
    const audienceScore = jaccard(input.audienceHints, brand.audience_fit);

    const score =
      0.4 * valuesScore + 0.2 * brandTagScore + 0.2 * sportScore + 0.2 * audienceScore;

    const overlap = brand.values_tags.filter((t) =>
      input.likedValueTags.includes(t)
    );
    const reasonTags = overlap.slice(0, 2);
    const reason =
      reasonTags.length === 2
        ? `You both care about ${labelTag(reasonTags[0])} and ${labelTag(reasonTags[1])}.`
        : reasonTags.length === 1
        ? `You both care about ${labelTag(reasonTags[0])}.`
        : sportScore > 0
        ? `Your sport fits their world — and ${brand.city ?? "local"} energy aligns.`
        : `A quiet good match on vibe and size.`;

    return { brand, score, reasonTags, reason };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
