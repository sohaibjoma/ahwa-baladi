export const TEA_TYPES = ['koshary', 'fatla', 'maghly'] as const;
export const STRENGTHS = ['khafeef', 'mazbout', 'teqeel'] as const;
export const SUGARS = ['sada', 'riha', 'mazbout', 'zyada'] as const;
export const ADDONS = ['none', 'mint', 'milk', 'cloves'] as const;

export type TeaType = (typeof TEA_TYPES)[number];
export type Strength = (typeof STRENGTHS)[number];
export type Sugar = (typeof SUGARS)[number];
export type Addon = (typeof ADDONS)[number];

export interface TeaOrder {
  type: TeaType;
  strength: Strength;
  sugar: Sugar;
  addon: Addon;
}

export const DEFAULT_ORDER: TeaOrder = {
  type: 'koshary',
  strength: 'mazbout',
  sugar: 'mazbout',
  addon: 'mint'
};

/** Sugar cubes that drop into the glass for each sugar level. */
export const SUGAR_CUBES: Record<Sugar, number> = {
  sada: 0,
  riha: 1,
  mazbout: 2,
  zyada: 4
};

/** The Ma'allem's three questions, each listing its answers in display order. */
export const QUIZ = {
  head: ['headache', 'chill', 'rushed'],
  meal: ['heavy', 'breakfast', 'empty'],
  spot: ['balcony', 'office', 'blanket']
} as const;

export type QuizQuestion = keyof typeof QUIZ;
export type QuizAnswer = (typeof QUIZ)[QuizQuestion][number];

/** What each answer does to the order. */
export const QUIZ_EFFECTS: Record<QuizAnswer, Partial<TeaOrder>> = {
  headache: { strength: 'teqeel', sugar: 'mazbout' },
  chill: { strength: 'mazbout', sugar: 'riha' },
  rushed: { strength: 'khafeef', sugar: 'zyada' },
  heavy: { addon: 'mint' },
  breakfast: { addon: 'milk' },
  empty: { addon: 'none' },
  balcony: { type: 'koshary' },
  office: { type: 'fatla' },
  blanket: { type: 'maghly' }
};

/** Golden amber → mahogany → Sa'eedi ink; boiling darkens it, milk turns it caramel. */
const LIQUID_COLORS: Record<
  'water' | 'maghly' | 'milk',
  Record<Strength, string>
> = {
  water: { khafeef: '#d08a2e', mazbout: '#9a3c14', teqeel: '#4a1208' },
  maghly: { khafeef: '#7a2a10', mazbout: '#4a1208', teqeel: '#2a0a04' },
  milk: { khafeef: '#e2bc8c', mazbout: '#d4a373', teqeel: '#b07a48' }
};

export function liquidColor({ type, strength, addon }: TeaOrder): string {
  const base =
    addon === 'milk' ? 'milk' : type === 'maghly' ? 'maghly' : 'water';
  return LIQUID_COLORS[base][strength];
}
