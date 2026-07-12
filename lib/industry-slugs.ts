const INDUSTRY_SLUG_MAP: Record<string, string> = {
  manufacturing: "proizvodstvo",
  finance: "finansy",
  healthcare: "zdravohranenie",
  retail: "roznica",
  education: "obrazovanie",
  automotive: "avtomobili",
  "it-tech": "it-tehnologii",
  "real-estate": "nedvizhimost",
  energy: "energiya",
  tourism: "turizm",
  "media-entertainment": "media-razvlecheniya",
  "agri-food": "selhoz-pischevaya",
  "ecology-climate": "ekologiya-klimat",
};

const SLUG_TO_INDUSTRY_ID: Record<string, string> = {};

for (const [id, slug] of Object.entries(INDUSTRY_SLUG_MAP)) {
  SLUG_TO_INDUSTRY_ID[slug] = id;
}

export function getIndustrySlug(industryId: string): string {
  return INDUSTRY_SLUG_MAP[industryId] ?? industryId;
}

export function getIndustryIdBySlug(slug: string): string | undefined {
  return SLUG_TO_INDUSTRY_ID[slug];
}
