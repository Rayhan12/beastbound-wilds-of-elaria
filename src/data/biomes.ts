import { BiomeId, RegionInfo } from '../types';

export interface BiomeMetadata {
  id: BiomeId;
  name: string;
  regionRange: [number, number];
  themeColor: string;
  accentColor: string;
  groundColor: string;
  pathColor: string;
  ambientWeather: 'clear' | 'rain' | 'snow' | 'fog' | 'ashfall' | 'storm';
  ambientMusic?: string;
  description: string;
  majorBoss: string;
  elementFocus: string;
}

export const BIOMES: Record<BiomeId, BiomeMetadata> = {
  greenwild: {
    id: 'greenwild',
    name: 'Greenwild',
    regionRange: [1, 10],
    themeColor: '#10b981',
    accentColor: '#34d399',
    groundColor: '#1b3b22',
    pathColor: '#3d3423',
    ambientWeather: 'clear',
    description: 'Verdant ancient forests, winding rivers, and rolling grasslands teeming with wolves and forest spiders.',
    majorBoss: 'The Elderfang',
    elementFocus: 'Nature & Physical',
  },
  emberlands: {
    id: 'emberlands',
    name: 'Emberlands',
    regionRange: [11, 20],
    themeColor: '#f97316',
    accentColor: '#fb923c',
    groundColor: '#2d1810',
    pathColor: '#451a03',
    ambientWeather: 'ashfall',
    description: 'Volcanic fissures, rivers of molten slag, and scorched stone ruins guarded by fire beasts.',
    majorBoss: 'Ignivar, the Burning Warden',
    elementFocus: 'Fire',
  },
  frostfang: {
    id: 'frostfang',
    name: 'Frostfang Mountains',
    regionRange: [21, 30],
    themeColor: '#38bdf8',
    accentColor: '#7dd3fc',
    groundColor: '#1a2e3b',
    pathColor: '#334155',
    ambientWeather: 'snow',
    description: 'Bitter blizzards, glacier caves, and frost-covered peaks where ice trolls and dire beasts prowl.',
    majorBoss: 'The White Maw',
    elementFocus: 'Frost',
  },
  dreadmoor: {
    id: 'dreadmoor',
    name: 'Dreadmoor',
    regionRange: [31, 40],
    themeColor: '#84cc16',
    accentColor: '#a3e635',
    groundColor: '#1a2614',
    pathColor: '#27272a',
    ambientWeather: 'fog',
    description: 'A treacherous, murky marsh saturated in poison mist, corpse crawlers, and swamp witches.',
    majorBoss: 'The Mire Queen',
    elementFocus: 'Poison',
  },
  sunken_kingdom: {
    id: 'sunken_kingdom',
    name: 'Sunken Kingdom',
    regionRange: [41, 50],
    themeColor: '#06b6d4',
    accentColor: '#22d3ee',
    groundColor: '#0f2933',
    pathColor: '#164e63',
    ambientWeather: 'rain',
    description: 'Submerged halls of an ancient empire, coral spires, and drowned monstrosities.',
    majorBoss: 'The Drowned King',
    elementFocus: 'Water & Frost',
  },
  stormreach: {
    id: 'stormreach',
    name: 'Stormreach',
    regionRange: [51, 60],
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    groundColor: '#261b36',
    pathColor: '#3b0764',
    ambientWeather: 'storm',
    description: 'Towering lightning-struck cliffs and gale-swept peaks inhabited by thunder griffins and harpies.',
    majorBoss: 'Vaelora, Queen of Storms',
    elementFocus: 'Storm',
  },
  ashen_empire: {
    id: 'ashen_empire',
    name: 'Ashen Empire',
    regionRange: [61, 70],
    themeColor: '#e11d48',
    accentColor: '#fb7185',
    groundColor: '#281c1f',
    pathColor: '#18181b',
    ambientWeather: 'ashfall',
    description: 'The charred ruins of the old high civilization, patrolled by iron constructs and armored revenants.',
    majorBoss: 'The Fallen Emperor',
    elementFocus: 'Fire & Physical',
  },
  dragonspine: {
    id: 'dragonspine',
    name: 'Dragonspine Crags',
    regionRange: [71, 80],
    themeColor: '#eab308',
    accentColor: '#fde047',
    groundColor: '#332617',
    pathColor: '#451a03',
    ambientWeather: 'clear',
    description: 'Jagged colossal peaks where primeval dragons, drakes, and elder wyverns hold dominion.',
    majorBoss: 'Gravarn the Ancient',
    elementFocus: 'Fire & Storm',
  },
  eldritch_wilds: {
    id: 'eldritch_wilds',
    name: 'Eldritch Wilds',
    regionRange: [81, 90],
    themeColor: '#ec4899',
    accentColor: '#f472b6',
    groundColor: '#2a152d',
    pathColor: '#4c0519',
    ambientWeather: 'fog',
    description: 'A dimensional rift zone where the laws of nature break down and void aberrations warp space.',
    majorBoss: 'The Nameless One',
    elementFocus: 'Void',
  },
  endlands: {
    id: 'endlands',
    name: 'The Endlands',
    regionRange: [91, 100],
    themeColor: '#ef4444',
    accentColor: '#f87171',
    groundColor: '#181119',
    pathColor: '#27272a',
    ambientWeather: 'storm',
    description: 'The epicenter of corruption spreading through Elaria. Here lies the genesis of all corrupted beasts.',
    majorBoss: 'Aurelion, The Beast Beyond',
    elementFocus: 'Cosmic & Void',
  },
};

// Generate 100 Regions data with rich naming, levels, and bosses
export const ALL_REGIONS: RegionInfo[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  let biome: BiomeId = 'greenwild';
  if (id <= 10) biome = 'greenwild';
  else if (id <= 20) biome = 'emberlands';
  else if (id <= 30) biome = 'frostfang';
  else if (id <= 40) biome = 'dreadmoor';
  else if (id <= 50) biome = 'sunken_kingdom';
  else if (id <= 60) biome = 'stormreach';
  else if (id <= 70) biome = 'ashen_empire';
  else if (id <= 80) biome = 'dragonspine';
  else if (id <= 90) biome = 'eldritch_wilds';
  else biome = 'endlands';

  const meta = BIOMES[biome];
  const biomeIndex = ((id - 1) % 10) + 1;
  const minLvl = Math.max(1, (id - 1) * 1 + 1);
  const maxLvl = minLvl + 4;

  const names: Record<BiomeId, string[]> = {
    greenwild: [
      'Whispering Woods',
      'Emerald Vale',
      'Oakheart Glade',
      'Riverbend Crossing',
      'Briarwood Thicket',
      'Mossy Ruins',
      'Hunter’s Rest',
      'Sylvan Grove',
      'Howling Hollow',
      'Elderfang Den',
    ],
    emberlands: [
      'Cinder Flats',
      'Magma Chasm',
      'Obsidian Ridge',
      'Scorched Canopy',
      'Basalt Hollow',
      'Flamekeeper Shrine',
      'Brimstone Springs',
      'Infernal Trench',
      'Furnace Gate',
      'Ignivar’s Crucible',
    ],
    frostfang: [
      'Frostfall Pass',
      'Shiverpeak Rise',
      'Glacier Grotto',
      'Rimepine Woods',
      'Frozen Tarn',
      'Pale Caverns',
      'Howling Crest',
      'Icebound Sanctuary',
      'Avalanche Valley',
      'Lair of the White Maw',
    ],
    dreadmoor: [
      'Murkwood Bog',
      'Rotting Fens',
      'Leechpool',
      'Vipermarsh',
      'Sunken Barrow',
      'Witch’s Mire',
      'Blackwater Reach',
      'Toxic Quagmire',
      'Sepulcher Swamp',
      'Mire Queen’s Throne',
    ],
    sunken_kingdom: [
      'Tidefall Shallows',
      'Drowned Pillars',
      'Coral Spire',
      'Abyssal Trench',
      'Sunken Plaza',
      'Submerged Archway',
      'Siren’s Cove',
      'Pearl Grotto',
      'Flooded Basilica',
      'Sanctum of the Drowned King',
    ],
    stormreach: [
      'Thunderhead Crag',
      'Gale Plateau',
      'Cloudbreak Ridge',
      'Lightning Spine',
      'Skyward Roost',
      'Static Bluffs',
      'Vortex Canyon',
      'Fulgarite Field',
      'Tempest Spire',
      'Eye of Vaelora',
    ],
    ashen_empire: [
      'Shattered Citadel',
      'Crumbling Ramparts',
      'Ironworks Ruins',
      'Ash-strewn Courtyard',
      'War-torn Colosseum',
      'Crypt of Legions',
      'Arsenal Bastion',
      'Revenant Keep',
      'Smoldering Throne',
      'Imperial Necropolis',
    ],
    dragonspine: [
      'Wyrmtooth Peaks',
      'Drake Hollow',
      'Sulfur Roost',
      'Scalecrest Ridge',
      'Draconic Chasm',
      'Ancient Caldera',
      'Bones of the First',
      'Dragonlord Gate',
      'High Wyvern Lair',
      'Summit of Gravarn',
    ],
    eldritch_wilds: [
      'Fractured Reality',
      'Warped Grove',
      'Voidpool Basin',
      'Whispering Monoliths',
      'Dimensional Rift',
      'Prism Cavern',
      'Torn Horizon',
      'Null Space Gap',
      'Madness Plateau',
      'Chamber of the Nameless One',
    ],
    endlands: [
      'Threshold of Oblivion',
      'Bleeding Sky Reach',
      'Root of Corruption',
      'Voidspire Bastion',
      'Shattered Cosmos',
      'Desolation Abyss',
      'Primordial Fault',
      'Genesis Chamber',
      'Apex Horizon',
      'Heart of Aurelion',
    ],
  };

  const name = names[biome][biomeIndex - 1] || `Region ${id}`;
  const isBossRegion = biomeIndex === 10;
  const bossName = isBossRegion ? meta.majorBoss : `Alpha ${biome === 'greenwild' ? 'Wolf' : 'Beast'} Lvl ${maxLvl}`;

  return {
    id,
    name,
    biome,
    minLevel: minLvl,
    maxLevel: maxLvl,
    bossName,
    bossDefeated: false,
    campDiscovered: id === 1, // first region camp unlocked
    explored: id === 1,
    description: `Region ${id} of Elaria, located in the ${meta.name}. ${isBossRegion ? 'Home to the apex regional ruler.' : 'Dangerous beast territory.'}`,
    weather: meta.ambientWeather,
    activeTracksCount: Math.floor(Math.random() * 3) + 2,
  };
});
