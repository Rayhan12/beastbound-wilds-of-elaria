export type ArchetypeId = 'vanguard' | 'ranger' | 'arcanist' | 'beastmaster' | 'reaper';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'ancient';

export type EquipSlot = 'weapon' | 'offhand' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'ring' | 'amulet' | 'charm';

export type ElementType = 'physical' | 'fire' | 'frost' | 'storm' | 'poison' | 'void';

export type BiomeId =
  | 'greenwild'
  | 'emberlands'
  | 'frostfang'
  | 'dreadmoor'
  | 'sunken_kingdom'
  | 'stormreach'
  | 'ashen_empire'
  | 'dragonspine'
  | 'eldritch_wilds'
  | 'endlands';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  critChance: number; // percentage (0 - 100)
  critDamage: number; // multiplier (e.g. 1.5)
  moveSpeed: number; // base speed
  elementalPower: number; // percentage bonus to elemental dmg
  fireResist: number;
  frostResist: number;
  stormResist: number;
  poisonResist: number;
  voidResist: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  key: 'Q' | 'W' | 'E' | 'R';
  description: string;
  cooldown: number; // in seconds
  staminaCost: number;
  icon: string;
  archetype: ArchetypeId;
  unlockedAtLevel: number;
  element: ElementType;
}

export interface Item {
  id: string;
  name: string;
  type: 'equipment' | 'material' | 'consumable' | 'quest' | 'trophy';
  slot?: EquipSlot;
  rarity: ItemRarity;
  levelReq: number;
  description: string;
  icon: string;
  stats?: Partial<PlayerStats>;
  element?: ElementType;
  passiveDesc?: string;
  stackCount?: number;
  value: number; // gold
}

export interface CraftingRecipe {
  id: string;
  resultItem: Item;
  requiredMaterials: { itemId: string; count: number; name: string }[];
  goldCost: number;
  guildRankReq: number;
  category: 'weapons' | 'armor' | 'accessories' | 'alchemy';
}

export interface MonsterDrop {
  item: Item;
  chance: number; // 0 to 1
  min: number;
  max: number;
}

export interface MonsterVariant {
  id: string;
  name: string;
  title?: string;
  biome: BiomeId;
  baseLevel: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  element: ElementType;
  weakness: ElementType;
  resistance: ElementType;
  isBoss?: boolean;
  isElite?: boolean;
  phases?: number;
  size: number;
  color: string;
  secondaryColor?: string;
  drops: MonsterDrop[];
  xpReward: number;
  goldReward: number;
  behaviors: ('chase' | 'flank' | 'charge' | 'ranged_spit' | 'summon' | 'enrage' | 'teleport' | 'web_trap')[];
}

export interface HuntContract {
  id: string;
  title: string;
  targetMonsterName: string;
  targetCount: number;
  currentCount: number;
  regionId: number;
  biome: BiomeId;
  rewards: {
    xp: number;
    gold: number;
    reputation: number;
    item?: Item;
  };
  completed: boolean;
  claimed: boolean;
  description: string;
}

export interface RegionInfo {
  id: number; // 1 to 100
  name: string;
  biome: BiomeId;
  minLevel: number;
  maxLevel: number;
  bossName: string;
  bossDefeated: boolean;
  campDiscovered: boolean;
  explored: boolean;
  description: string;
  weather: 'clear' | 'rain' | 'snow' | 'fog' | 'ashfall' | 'storm';
  activeTracksCount: number;
}

export interface CodexEntry {
  monsterId: string;
  name: string;
  biome: BiomeId;
  threatLevel: 'Low' | 'Moderate' | 'Dangerous' | 'Lethal' | 'Cataclysmic';
  weakness: string;
  resistance: string;
  killCount: number;
  discovered: boolean;
  dropsFound: string[];
}

export interface ActiveProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  isPlayer: boolean;
  lifetime: number;
  element: ElementType;
  piercing?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  lifetime: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark';
}

export interface BeastTrack {
  id: string;
  x: number;
  y: number;
  type: 'footprint' | 'claw_mark' | 'blood_trail' | 'carcass' | 'beast_scent';
  targetMonsterId: string;
  revealed: boolean;
  directionAngle: number;
}

export interface HunterCharacter {
  id: string;
  name: string;
  archetype: ArchetypeId;
  level: number;
  xp: number;
  nextXp: number;
  gold: number;
  guildRank: number; // 1 to 9
  guildRep: number;
  skillPoints: number;
  attributePoints: number;
  stats: PlayerStats;
  allocatedAttributes?: {
    health: number;
    attack: number;
    defense: number;
    stamina: number;
    speed: number;
  };
  skillLevels?: Record<string, number>;
  equipped: {
    weapon?: Item;
    offhand?: Item;
    helmet?: Item;
    chest?: Item;
    gloves?: Item;
    boots?: Item;
    ring?: Item;
    amulet?: Item;
    charm?: Item;
  };
  inventory: Item[];
  unlockedSkills: string[];
  activeSkills: {
    Q: string;
    W: string;
    E: string;
    R: string;
  };
  currentRegionId: number;
  discoveredRegions: number[];
  discoveredCamps: number[];
  defeatedBosses: string[];
  contracts: HuntContract[];
  codex: Record<string, CodexEntry>;
  trophies: string[];
  potions: {
    health: number;
    stamina: number;
    hunterElixir: number;
  };
  createdAt: number;
  lastSavedAt: number;
}
