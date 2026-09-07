import { HunterCharacter, ArchetypeId, Item } from '../types';
import { ARCHETYPE_INFO } from '../data/skills';
import { BASE_ITEMS } from '../data/items';
import { ALL_REGIONS } from '../data/biomes';
import { MONSTER_DEFINITIONS } from '../data/monsters';

const SAVE_KEY = 'beastbound_save_v1';

export function createInitialCharacter(name: string, archetype: ArchetypeId): HunterCharacter {
  const info = ARCHETYPE_INFO[archetype];
  const weapon = BASE_ITEMS[info.defaultWeaponId] || BASE_ITEMS['novice_sword'];

  const initialCodex: HunterCharacter['codex'] = {};
  Object.values(MONSTER_DEFINITIONS).forEach((m) => {
    initialCodex[m.id] = {
      monsterId: m.id,
      name: m.name,
      biome: m.biome,
      threatLevel: m.isBoss ? 'Cataclysmic' : m.isElite ? 'Dangerous' : 'Moderate',
      weakness: m.weakness.toUpperCase(),
      resistance: m.resistance.toUpperCase(),
      killCount: 0,
      discovered: m.biome === 'greenwild' && !m.isBoss,
      dropsFound: [],
    };
  });

  return {
    id: `hunter_${Date.now()}`,
    name: name.trim() || 'Valen',
    archetype,
    level: 1,
    xp: 0,
    nextXp: 100,
    gold: 50,
    guildRank: 1, // Novice Hunter
    guildRep: 0,
    skillPoints: 1,
    attributePoints: 5,
    allocatedAttributes: {
      health: 0,
      attack: 0,
      defense: 0,
      stamina: 0,
      speed: 0,
    },
    skillLevels: {
      [info.skills.Q]: 1,
      [info.skills.W]: 1,
      [info.skills.E]: 1,
      [info.skills.R]: 1,
    },
    stats: {
      health: info.bonusStats.health,
      maxHealth: info.bonusStats.health,
      stamina: info.bonusStats.stamina,
      maxStamina: info.bonusStats.stamina,
      attack: info.bonusStats.attack + (weapon.stats?.attack || 0),
      defense: info.bonusStats.defense,
      critChance: info.bonusStats.critChance + (weapon.stats?.critChance || 0),
      critDamage: 1.5,
      moveSpeed: info.bonusStats.speed,
      elementalPower: 0,
      fireResist: 0,
      frostResist: 0,
      stormResist: 0,
      poisonResist: 0,
      voidResist: 0,
    },
    equipped: {
      weapon,
      chest: BASE_ITEMS['hunter_tunic'],
      boots: BASE_ITEMS['stalker_boots'],
    },
    inventory: [
      { ...BASE_ITEMS['health_potion'], stackCount: 5 },
      { ...BASE_ITEMS['stamina_potion'], stackCount: 3 },
      { ...BASE_ITEMS['wolf_pelt'], stackCount: 2 },
    ],
    unlockedSkills: [info.skills.Q],
    activeSkills: {
      Q: info.skills.Q,
      W: info.skills.W,
      E: info.skills.E,
      R: info.skills.R,
    },
    currentRegionId: 1,
    discoveredRegions: [1],
    discoveredCamps: [1],
    defeatedBosses: [],
    contracts: [
      {
        id: 'contract_1',
        title: 'Forest Wolf Threat',
        targetMonsterName: 'Forest Wolf',
        targetCount: 3,
        currentCount: 0,
        regionId: 1,
        biome: 'greenwild',
        rewards: {
          xp: 150,
          gold: 45,
          reputation: 25,
          item: BASE_ITEMS['sharp_fang'],
        },
        completed: false,
        claimed: false,
        description: 'Greenhaven foresters report aggressive wolf packs near the village perimeter. Slay 3 wolves.',
      },
      {
        id: 'contract_2',
        title: 'Apex Tracking: Dire Alpha',
        targetMonsterName: 'Corrupted Alpha Wolf',
        targetCount: 1,
        currentCount: 0,
        regionId: 1,
        biome: 'greenwild',
        rewards: {
          xp: 400,
          gold: 120,
          reputation: 60,
          item: BASE_ITEMS['beast_fang_necklace'],
        },
        completed: false,
        claimed: false,
        description: 'Follow claw marks and scent trails to locate and eliminate a mutated blighted alpha.',
      },
    ],
    codex: initialCodex,
    trophies: [],
    potions: {
      health: 5,
      stamina: 3,
      hunterElixir: 1,
    },
    createdAt: Date.now(),
    lastSavedAt: Date.now(),
  };
}

export const loadCharacter = loadSavedCharacter;
export function loadSavedCharacter(): HunterCharacter | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.stats || !parsed.archetype) {
      return null;
    }
    if (!parsed.inventory) parsed.inventory = [];
    if (!parsed.equipped) parsed.equipped = {};
    if (!parsed.potions) parsed.potions = { health: 5, stamina: 3, hunterElixir: 1 };
    if (!parsed.discoveredRegions) parsed.discoveredRegions = [1];
    if (!parsed.discoveredCamps) parsed.discoveredCamps = [1];
    if (!parsed.codex) parsed.codex = {};
    if (!parsed.trophies) parsed.trophies = [];
    if (!parsed.contracts) parsed.contracts = [];
    if (!parsed.allocatedAttributes) {
      parsed.allocatedAttributes = { health: 0, attack: 0, defense: 0, stamina: 0, speed: 0 };
    }
    const info = ARCHETYPE_INFO[parsed.archetype] || ARCHETYPE_INFO['ranger'];
    if (!parsed.skillLevels) {
      parsed.skillLevels = {
        [parsed.activeSkills?.Q || info.skills.Q]: 1,
        [parsed.activeSkills?.W || info.skills.W]: 1,
        [parsed.activeSkills?.E || info.skills.E]: 1,
        [parsed.activeSkills?.R || info.skills.R]: 1,
      };
    }
    if (parsed.level == null || parsed.level < 1) parsed.level = 1;
    if (parsed.xp == null) parsed.xp = 0;
    if (!parsed.nextXp) parsed.nextXp = 100;
    if (parsed.skillPoints == null) parsed.skillPoints = 1;
    if (parsed.attributePoints == null) parsed.attributePoints = 5;

    // Award any pending level ups if xp exceeds nextXp
    if (parsed.xp >= parsed.nextXp) {
      const { updated } = awardExperience(parsed, 0);
      return updated;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load save:', err);
    return null;
  }
}

export function saveCharacter(char: HunterCharacter): void {
  try {
    const toSave = { ...char, lastSavedAt: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save character:', err);
  }
}

export function exportSaveFile(char: HunterCharacter): void {
  const jsonStr = JSON.stringify(char, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Beastbound_${char.name}_Lvl${char.level}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function recalculateStats(char: HunterCharacter): HunterCharacter {
  const info = ARCHETYPE_INFO[char.archetype] || ARCHETYPE_INFO['ranger'];
  const alloc = char.allocatedAttributes || { health: 0, attack: 0, defense: 0, stamina: 0, speed: 0 };

  const baseHp = info.bonusStats.health + (char.level - 1) * 25 + alloc.health * 35;
  const baseStamina = info.bonusStats.stamina + (char.level - 1) * 5 + alloc.stamina * 15;
  const baseAtk = info.bonusStats.attack + (char.level - 1) * 4 + alloc.attack * 5;
  const baseDef = info.bonusStats.defense + (char.level - 1) * 3 + alloc.defense * 4;
  const baseCrit = info.bonusStats.critChance;
  const baseSpeed = info.bonusStats.speed + alloc.speed * 3;

  let bonusHp = 0;
  let bonusStam = 0;
  let bonusAtk = 0;
  let bonusDef = 0;
  let bonusCrit = 0;
  let bonusSpeed = 0;
  let bonusEle = 0;

  // Add stats from all equipped gear
  Object.values(char.equipped).forEach((item) => {
    if (item && item.stats) {
      if (item.stats.maxHealth) bonusHp += item.stats.maxHealth;
      if (item.stats.maxStamina) bonusStam += item.stats.maxStamina;
      if (item.stats.attack) bonusAtk += item.stats.attack;
      if (item.stats.defense) bonusDef += item.stats.defense;
      if (item.stats.critChance) bonusCrit += item.stats.critChance;
      if (item.stats.moveSpeed) bonusSpeed += item.stats.moveSpeed;
      if (item.stats.elementalPower) bonusEle += item.stats.elementalPower;
    }
  });

  const maxHealth = baseHp + bonusHp;
  const maxStamina = baseStamina + bonusStam;

  return {
    ...char,
    stats: {
      ...char.stats,
      maxHealth,
      health: Math.min(char.stats.health, maxHealth),
      maxStamina,
      stamina: Math.min(char.stats.stamina, maxStamina),
      attack: baseAtk + bonusAtk,
      defense: baseDef + bonusDef,
      critChance: baseCrit + bonusCrit,
      moveSpeed: baseSpeed + bonusSpeed,
      elementalPower: bonusEle,
    },
  };
}

export function awardExperience(char: HunterCharacter, amount: number): { updated: HunterCharacter; leveledUp: boolean } {
  let xp = (char.xp || 0) + amount;
  let level = char.level || 1;
  let nextXp = char.nextXp || 100;
  let leveledUp = false;
  let skillPoints = char.skillPoints || 0;
  let attributePoints = char.attributePoints || 0;

  while (xp >= nextXp && level < 100) {
    xp -= nextXp;
    level += 1;
    nextXp = Math.floor(nextXp * 1.35 + 50);
    skillPoints += 1;
    attributePoints += 3;
    leveledUp = true;
  }

  let updated: HunterCharacter = {
    ...char,
    level,
    xp,
    nextXp,
    skillPoints,
    attributePoints,
  };

  if (leveledUp) {
    updated = recalculateStats(updated);
    updated.stats.health = updated.stats.maxHealth;
    updated.stats.stamina = updated.stats.maxStamina;
  }

  return { updated, leveledUp };
}

export const GUILD_RANKS = [
  'Novice Hunter',
  'Apprentice Tracker',
  'Wilderness Hunter',
  'Veteran Beastmaster',
  'Elite Slayer',
  'Master Hunter',
  'Highland Legend',
  'Beast Sovereign Slayer',
  'Elarian Champion',
];
