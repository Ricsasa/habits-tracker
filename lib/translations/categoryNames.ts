export const DEFAULT_CATEGORY_KEYS: Record<string, string> = {
  Study: 'categories.study',
  Exercise: 'categories.exercise',
  'Personal Improvement': 'categories.personals',
  Spaces: 'categories.spaces',
};

export const DEFAULT_TAG_KEYS: Record<string, string> = {
  gym: 'tags.gym',
  yoga: 'tags.yoga',
  pilates: 'tags.pilates',
  running: 'tags.running',
  'dog walks': 'tags.dogWalks',
  treadmill: 'tags.treadmill',
  hike: 'tags.hike',
  leetcode: 'tags.leetcode',
  aws: 'tags.aws',
  nodejs: 'tags.nodejs',
  react: 'tags.react',
  php: 'tags.php',
  meditation: 'tags.meditation',
  socialization: 'tags.socialization',
  psychology: 'tags.psychology',
  reading: 'tags.reading',
  cleaning: 'tags.cleaning',
  cooking: 'tags.cooking',
  decluttering: 'tags.decluttering',
};

export type Translator = (key: string, vars?: Record<string, string | number>) => string;

export function translateCategoryName(name: string, t: Translator): string {
  const key = DEFAULT_CATEGORY_KEYS[name];
  return key ? t(key) : name;
}

export function translateTagName(name: string, t: Translator): string {
  const key = DEFAULT_TAG_KEYS[name];
  return key ? t(key) : name;
}
