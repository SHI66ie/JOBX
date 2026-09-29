import catalog from "@/data/skills.json";

export type Skill = { name: string; category: string };

/** Flattened, de-duplicated catalogue in priority order (tech categories first). */
export const SKILLS: Skill[] = (() => {
  const seen = new Set<string>();
  const out: Skill[] = [];
  for (const [category, names] of Object.entries(catalog as Record<string, string[]>)) {
    for (const name of names) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ name, category });
    }
  }
  return out;
})();

function rank(name: string, query: string) {
  const lower = name.toLowerCase();
  if (lower === query) return 0;
  if (lower.startsWith(query)) return 1;
  if (lower.split(/[\s/&().-]+/).some((word) => word.startsWith(query))) return 2;
  if (lower.includes(query)) return 3;
  return -1;
}

/** Best matches for `query`, skipping anything already in `exclude`. */
export function searchSkills(query: string, exclude: string[] = [], limit = 8): Skill[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const taken = new Set(exclude.map((item) => item.toLowerCase()));

  return SKILLS.map((skill, index) => ({ skill, index, score: rank(skill.name, q) }))
    .filter(({ skill, score }) => score >= 0 && !taken.has(skill.name.toLowerCase()))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ skill }) => skill);
}
