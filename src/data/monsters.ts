import { MonsterVariant, BiomeId } from '../types';
import { BASE_ITEMS } from './items';

export const MONSTER_DEFINITIONS: Record<string, MonsterVariant> = {
  // Greenwild beasts (Regions 1 - 10)
  forest_wolf: {
    id: 'forest_wolf',
    name: 'Forest Wolf',
    biome: 'greenwild',
    baseLevel: 1,
    health: 120,
    attack: 16,
    defense: 6,
    speed: 130,
    size: 20,
    color: '#64748b',
    secondaryColor: '#334155',
    element: 'physical',
    weakness: 'fire',
    resistance: 'frost',
    xpReward: 35,
    goldReward: 8,
    behaviors: ['flank', 'chase'],
    drops: [
      { item: BASE_ITEMS['wolf_pelt'], chance: 0.8, min: 1, max: 2 },
      { item: BASE_ITEMS['sharp_fang'], chance: 0.5, min: 1, max: 2 },
      { item: BASE_ITEMS['beast_meat'], chance: 0.6, min: 1, max: 2 },
    ],
  },
  dire_wolf: {
    id: 'dire_wolf',
    name: 'Dire Wolf',
    biome: 'greenwild',
    baseLevel: 3,
    health: 240,
    attack: 26,
    defense: 12,
    speed: 145,
    size: 24,
    color: '#475569',
    secondaryColor: '#1e293b',
    element: 'physical',
    weakness: 'fire',
    resistance: 'poison',
    xpReward: 75,
    goldReward: 16,
    behaviors: ['flank', 'chase', 'charge'],
    drops: [
      { item: BASE_ITEMS['wolf_pelt'], chance: 0.95, min: 2, max: 3 },
      { item: BASE_ITEMS['sharp_fang'], chance: 0.8, min: 2, max: 3 },
      { item: BASE_ITEMS['beast_meat'], chance: 0.75, min: 1, max: 2 },
    ],
  },
  wild_boar: {
    id: 'wild_boar',
    name: 'Razorback Boar',
    biome: 'greenwild',
    baseLevel: 2,
    health: 200,
    attack: 22,
    defense: 16,
    speed: 100,
    size: 22,
    color: '#78350f',
    secondaryColor: '#451a03',
    element: 'physical',
    weakness: 'storm',
    resistance: 'physical',
    xpReward: 50,
    goldReward: 12,
    behaviors: ['charge', 'chase'],
    drops: [
      { item: BASE_ITEMS['sharp_fang'], chance: 0.7, min: 1, max: 2 },
      { item: BASE_ITEMS['beast_meat'], chance: 0.9, min: 2, max: 3 },
    ],
  },
  forest_spider: {
    id: 'forest_spider',
    name: 'Thornweb Spider',
    biome: 'greenwild',
    baseLevel: 4,
    health: 180,
    attack: 24,
    defense: 8,
    speed: 110,
    size: 22,
    color: '#15803d',
    secondaryColor: '#14532d',
    element: 'poison',
    weakness: 'fire',
    resistance: 'poison',
    xpReward: 70,
    goldReward: 14,
    behaviors: ['web_trap', 'ranged_spit', 'chase'],
    drops: [
      { item: BASE_ITEMS['sharp_fang'], chance: 0.6, min: 1, max: 2 },
      { item: BASE_ITEMS['health_potion'], chance: 0.35, min: 1, max: 1 },
    ],
  },

  // Elite in Greenwild
  elite_corrupted_alpha: {
    id: 'elite_corrupted_alpha',
    name: 'Corrupted Alpha Wolf',
    title: 'Blighted Packleader [Elite]',
    biome: 'greenwild',
    baseLevel: 7,
    health: 750,
    attack: 42,
    defense: 22,
    speed: 160,
    size: 32,
    color: '#831843',
    secondaryColor: '#be185d',
    isElite: true,
    element: 'poison',
    weakness: 'fire',
    resistance: 'frost',
    xpReward: 260,
    goldReward: 65,
    behaviors: ['flank', 'charge', 'summon', 'enrage'],
    drops: [
      { item: BASE_ITEMS['wolf_pelt'], chance: 1, min: 3, max: 5 },
      { item: BASE_ITEMS['elder_claw'], chance: 0.85, min: 1, max: 2 },
      { item: BASE_ITEMS['beast_fang_necklace'], chance: 0.4, min: 1, max: 1 },
    ],
  },

  // REGIONAL BOSS 1: The Elderfang (Region 10)
  the_elderfang: {
    id: 'the_elderfang',
    name: 'The Elderfang',
    title: 'The Blighted Sovereign of the Wilds [Regional Boss]',
    biome: 'greenwild',
    baseLevel: 10,
    health: 2400,
    attack: 58,
    defense: 30,
    speed: 155,
    size: 46,
    color: '#4c0519',
    secondaryColor: '#dc2626',
    isBoss: true,
    phases: 4,
    element: 'physical',
    weakness: 'fire',
    resistance: 'frost',
    xpReward: 1200,
    goldReward: 350,
    behaviors: ['charge', 'flank', 'summon', 'enrage'],
    drops: [
      { item: BASE_ITEMS['elderfangs_fang'], chance: 1, min: 1, max: 1 },
      { item: BASE_ITEMS['elder_claw'], chance: 1, min: 3, max: 5 },
      { item: BASE_ITEMS['wolf_pelt'], chance: 1, min: 6, max: 10 },
      { item: BASE_ITEMS['hunter_elixir'], chance: 1, min: 2, max: 3 },
    ],
  },

  // Emberlands beasts (Regions 11 - 20)
  magma_slime: {
    id: 'magma_slime',
    name: 'Magma Slime',
    biome: 'emberlands',
    baseLevel: 12,
    health: 420,
    attack: 38,
    defense: 25,
    speed: 85,
    size: 24,
    color: '#ea580c',
    secondaryColor: '#c2410c',
    element: 'fire',
    weakness: 'frost',
    resistance: 'fire',
    xpReward: 130,
    goldReward: 28,
    behaviors: ['chase', 'ranged_spit'],
    drops: [
      { item: BASE_ITEMS['fire_core'], chance: 0.5, min: 1, max: 1 },
      { item: BASE_ITEMS['beast_meat'], chance: 0.6, min: 1, max: 2 },
    ],
  },
  fire_wolf: {
    id: 'fire_wolf',
    name: 'Cinderhound',
    biome: 'emberlands',
    baseLevel: 14,
    health: 520,
    attack: 48,
    defense: 22,
    speed: 165,
    size: 26,
    color: '#b45309',
    secondaryColor: '#f59e0b',
    element: 'fire',
    weakness: 'frost',
    resistance: 'fire',
    xpReward: 180,
    goldReward: 40,
    behaviors: ['flank', 'charge', 'chase'],
    drops: [
      { item: BASE_ITEMS['fire_core'], chance: 0.75, min: 1, max: 2 },
      { item: BASE_ITEMS['sharp_fang'], chance: 0.8, min: 2, max: 4 },
    ],
  },

  // REGIONAL BOSS 2: Ignivar (Region 20)
  ignivar_boss: {
    id: 'ignivar_boss',
    name: 'Ignivar, the Burning Warden',
    title: 'Scion of the Obsidian Trench [Regional Boss]',
    biome: 'emberlands',
    baseLevel: 20,
    health: 4800,
    attack: 85,
    defense: 45,
    speed: 130,
    size: 52,
    color: '#7c2d12',
    secondaryColor: '#f97316',
    isBoss: true,
    phases: 3,
    element: 'fire',
    weakness: 'frost',
    resistance: 'fire',
    xpReward: 3200,
    goldReward: 800,
    behaviors: ['charge', 'ranged_spit', 'enrage'],
    drops: [
      { item: BASE_ITEMS['ignivars_core_armor'], chance: 1, min: 1, max: 1 },
      { item: BASE_ITEMS['fire_core'], chance: 1, min: 5, max: 8 },
    ],
  },

  // Frostfang beasts (Regions 21 - 30)
  frost_wolf: {
    id: 'frost_wolf',
    name: 'Rimefang Wolf',
    biome: 'frostfang',
    baseLevel: 22,
    health: 720,
    attack: 62,
    defense: 35,
    speed: 150,
    size: 26,
    color: '#0284c7',
    secondaryColor: '#38bdf8',
    element: 'frost',
    weakness: 'fire',
    resistance: 'frost',
    xpReward: 260,
    goldReward: 55,
    behaviors: ['flank', 'chase'],
    drops: [
      { item: BASE_ITEMS['frost_shard'], chance: 0.7, min: 1, max: 2 },
      { item: BASE_ITEMS['wolf_pelt'], chance: 0.9, min: 2, max: 4 },
    ],
  },
  ice_troll: {
    id: 'ice_troll',
    name: 'Glacial Stone Troll',
    biome: 'frostfang',
    baseLevel: 25,
    health: 1200,
    attack: 82,
    defense: 55,
    speed: 90,
    size: 36,
    color: '#0f766e',
    secondaryColor: '#5eead4',
    element: 'frost',
    weakness: 'fire',
    resistance: 'physical',
    xpReward: 420,
    goldReward: 90,
    behaviors: ['charge', 'chase'],
    drops: [
      { item: BASE_ITEMS['frost_shard'], chance: 0.9, min: 2, max: 4 },
      { item: BASE_ITEMS['white_maw_ring'], chance: 0.25, min: 1, max: 1 },
    ],
  },

  // REGIONAL BOSS 3: The White Maw (Region 30)
  the_white_maw: {
    id: 'the_white_maw',
    name: 'The White Maw',
    title: 'The Glacial Terror of Frostfall [Regional Boss]',
    biome: 'frostfang',
    baseLevel: 30,
    health: 7500,
    attack: 115,
    defense: 65,
    speed: 140,
    size: 56,
    color: '#075985',
    secondaryColor: '#e0f2fe',
    isBoss: true,
    phases: 3,
    element: 'frost',
    weakness: 'fire',
    resistance: 'frost',
    xpReward: 6500,
    goldReward: 1500,
    behaviors: ['charge', 'flank', 'summon', 'enrage'],
    drops: [
      { item: BASE_ITEMS['white_maw_ring'], chance: 1, min: 1, max: 1 },
      { item: BASE_ITEMS['frost_shard'], chance: 1, min: 6, max: 10 },
    ],
  },

  // High Biome Representatives (Stormreach, Dragonspine, Endlands)
  storm_griffin: {
    id: 'storm_griffin',
    name: 'Thundercrest Griffin',
    biome: 'stormreach',
    baseLevel: 52,
    health: 2200,
    attack: 145,
    defense: 80,
    speed: 180,
    size: 38,
    color: '#7e22ce',
    secondaryColor: '#c084fc',
    element: 'storm',
    weakness: 'physical',
    resistance: 'storm',
    xpReward: 1400,
    goldReward: 260,
    behaviors: ['charge', 'teleport', 'chase'],
    drops: [
      { item: BASE_ITEMS['stormcaller_bow'], chance: 0.3, min: 1, max: 1 },
    ],
  },
  dragon_wyvern: {
    id: 'dragon_wyvern',
    name: 'Crimson Dreadwyrm',
    biome: 'dragonspine',
    baseLevel: 75,
    health: 4800,
    attack: 240,
    defense: 130,
    speed: 160,
    size: 48,
    color: '#991b1b',
    secondaryColor: '#fca5a5',
    element: 'fire',
    weakness: 'frost',
    resistance: 'fire',
    xpReward: 4800,
    goldReward: 900,
    behaviors: ['charge', 'ranged_spit', 'enrage'],
    drops: [
      { item: BASE_ITEMS['dragon_scale'], chance: 1, min: 3, max: 6 },
    ],
  },
  aurelion_apex_boss: {
    id: 'aurelion_apex_boss',
    name: 'Aurelion, The Beast Beyond',
    title: 'The Origin of the World Corruption [Final Boss]',
    biome: 'endlands',
    baseLevel: 100,
    health: 35000,
    attack: 480,
    defense: 250,
    speed: 170,
    size: 68,
    color: '#18021c',
    secondaryColor: '#f43f5e',
    isBoss: true,
    phases: 4,
    element: 'void',
    weakness: 'physical',
    resistance: 'void',
    xpReward: 50000,
    goldReward: 10000,
    behaviors: ['charge', 'teleport', 'summon', 'ranged_spit', 'enrage'],
    drops: [
      { item: BASE_ITEMS['crown_of_fallen'], chance: 1, min: 1, max: 1 },
    ],
  },
};

export function getMonsterForRegion(regionId: number, biome: BiomeId, isBossRequest = false): MonsterVariant {
  if (isBossRequest) {
    if (regionId === 10) return MONSTER_DEFINITIONS['the_elderfang'];
    if (regionId === 20) return MONSTER_DEFINITIONS['ignivar_boss'];
    if (regionId === 30) return MONSTER_DEFINITIONS['the_white_maw'];
    if (regionId === 100) return MONSTER_DEFINITIONS['aurelion_apex_boss'];

    // Regional Champion variant scaled to region
    const base = regionId > 70 ? MONSTER_DEFINITIONS['dragon_wyvern'] :
                 regionId > 50 ? MONSTER_DEFINITIONS['storm_griffin'] :
                 regionId > 20 ? MONSTER_DEFINITIONS['ice_troll'] :
                 regionId > 10 ? MONSTER_DEFINITIONS['fire_wolf'] :
                 MONSTER_DEFINITIONS['dire_wolf'];

    const multiplier = 1 + (regionId * 0.08);
    return {
      ...base,
      id: `boss_reg_${regionId}`,
      name: `Apex ${base.name} of Region ${regionId}`,
      title: `Regional Champion [Level ${Math.min(100, Math.floor(regionId * 1.1))}]`,
      isBoss: true,
      health: Math.floor(base.health * 2.8 * multiplier),
      attack: Math.floor(base.attack * 1.5 * multiplier),
      defense: Math.floor(base.defense * 1.3 * multiplier),
      xpReward: Math.floor(base.xpReward * 4 * multiplier),
      goldReward: Math.floor(base.goldReward * 3 * multiplier),
      size: Math.floor(base.size * 1.35),
      color: '#9f1239',
      secondaryColor: '#fbbf24',
    };
  }

  // Standard or elite wilderness beasts
  if (biome === 'greenwild') {
    const roll = Math.random();
    if (roll < 0.15) return MONSTER_DEFINITIONS['elite_corrupted_alpha'];
    if (roll < 0.45) return MONSTER_DEFINITIONS['dire_wolf'];
    if (roll < 0.7) return MONSTER_DEFINITIONS['wild_boar'];
    if (roll < 0.85) return MONSTER_DEFINITIONS['forest_spider'];
    return MONSTER_DEFINITIONS['forest_wolf'];
  }
  if (biome === 'emberlands') {
    return Math.random() < 0.5 ? MONSTER_DEFINITIONS['magma_slime'] : MONSTER_DEFINITIONS['fire_wolf'];
  }
  if (biome === 'frostfang') {
    return Math.random() < 0.6 ? MONSTER_DEFINITIONS['frost_wolf'] : MONSTER_DEFINITIONS['ice_troll'];
  }
  if (biome === 'stormreach') {
    return MONSTER_DEFINITIONS['storm_griffin'];
  }
  if (biome === 'dragonspine') {
    return MONSTER_DEFINITIONS['dragon_wyvern'];
  }
  if (biome === 'endlands') {
    return MONSTER_DEFINITIONS['aurelion_apex_boss'];
  }

  // Fallback scaled variant
  return MONSTER_DEFINITIONS['forest_wolf'];
}
