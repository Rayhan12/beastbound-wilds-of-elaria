import React from 'react';
import { HunterCharacter, RegionInfo } from '../types';
import { GameWorldState } from '../game/gameLoop';
import { SKILL_DEFINITIONS } from '../data/skills';
import { BIOMES } from '../data/biomes';
import { soundEngine } from '../audio/soundEngine';

interface TacticalHUDProps {
  char: HunterCharacter;
  world: GameWorldState;
  region: RegionInfo;
  onOpenMap: () => void;
  onOpenCharacter: () => void;
  onOpenInventory: () => void;
  onOpenContracts: () => void;
  onOpenCodex: () => void;
  onSaveGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerSkill: (key: 'Q' | 'W' | 'E' | 'R') => void;
  onTriggerDodge: () => void;
  onTriggerAttack: () => void;
  onTriggerHunterSense: () => void;
  onTriggerPotion: (type: 'health' | 'stamina') => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  char,
  world,
  region,
  onOpenMap,
  onOpenCharacter,
  onOpenInventory,
  onOpenContracts,
  onOpenCodex,
  onSaveGame,
  isMuted,
  onToggleMute,
  onTriggerSkill,
  onTriggerDodge,
  onTriggerAttack,
  onTriggerHunterSense,
  onTriggerPotion,
}) => {
  const biomeMeta = BIOMES[region.biome] || BIOMES['greenwild'];

  const hpFrac = Math.max(0, Math.min(1, char.stats.health / char.stats.maxHealth));
  const staminaFrac = Math.max(0, Math.min(1, char.stats.stamina / char.stats.maxStamina));
  const xpFrac = Math.max(0, Math.min(1, char.xp / char.nextXp));

  // Time format
  const hours = Math.floor(world.gameTimeHours);
  const minutes = Math.floor((world.gameTimeHours % 1) * 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const isNight = hours >= 20 || hours < 6;

  // Active Boss in Combat
  const activeBoss = world.monsters.find(
    (m) => m.isBoss && m.health > 0 && Math.hypot(m.x - world.playerX, m.y - world.playerY) < 600
  );

  // Radar contacts (nearby monsters)
  const radarContacts = world.monsters
    .filter((m) => m.health > 0)
    .map((m) => {
      const dist = Math.hypot(m.x - world.playerX, m.y - world.playerY);
      return {
        name: m.def.name,
        isBoss: m.isBoss,
        isElite: m.isElite,
        distMeters: Math.floor(dist / 20),
        threat: m.isBoss ? 'LETHAL' : m.isElite ? 'HIGH' : 'MODERATE',
      };
    })
    .sort((a, b) => a.distMeters - b.distMeters)
    .slice(0, 4);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none font-mono">
      {/* Background scanline subtle overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4df2ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* TOP HEADER - IMMERSIVE UI COMMAND BAR */}
      <header className="w-full h-18 border-b border-cyan-900/50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-between px-6 z-20 pointer-events-auto">
        {/* Pilot / Hunter Signal & Health */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Hunter Signal</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-cyan-100 tracking-wide">{char.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-400 uppercase">
                LVL {char.level} {char.archetype}
              </span>
            </div>
          </div>

          <div className="h-9 w-[1px] bg-cyan-900/60 hidden sm:block" />

          {/* Health Gauge */}
          <div className="flex flex-col">
            <div className="flex justify-between text-[10px] text-cyan-500 uppercase tracking-wider">
              <span>Vitality [HP]</span>
              <span className="text-cyan-200">
                {Math.floor(char.stats.health)} / {char.stats.maxHealth}
              </span>
            </div>
            <div className="w-40 sm:w-48 h-2 bg-cyan-950 mt-1 border border-cyan-900 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-150 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                style={{ width: `${hpFrac * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Sector Coordinates & Time */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] text-cyan-600 uppercase tracking-widest">
            {biomeMeta.name.toUpperCase()} // REGION {region.id.toString().padStart(2, '0')}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-cyan-100">{region.name}</span>
            <span
              className={`text-[10px] px-2 py-0.5 border ${
                isNight ? 'border-purple-600 bg-purple-950/40 text-purple-300' : 'border-amber-600 bg-amber-950/40 text-amber-300'
              }`}
            >
              {timeStr} {isNight ? 'NIGHT' : 'DAY'}
            </span>
          </div>
        </div>

        {/* Right Stamina, Gold & Tactical Menu */}
        <div className="flex items-center gap-4 sm:gap-6 text-right">
          {/* Stamina Power */}
          <div className="flex flex-col">
            <div className="flex justify-between text-[10px] text-orange-600 uppercase tracking-wider">
              <span>Vigor [STM]</span>
              <span className="text-orange-200">
                {Math.floor(char.stats.stamina)} / {char.stats.maxStamina}
              </span>
            </div>
            <div className="w-32 sm:w-44 h-2 bg-orange-950 mt-1 border border-orange-900 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-150 shadow-[0_0_10px_rgba(249,115,22,0.7)]"
                style={{ width: `${staminaFrac * 100}%` }}
              />
            </div>
          </div>

          {/* Credits / Gold */}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wide">{char.gold.toLocaleString()}</span>
            <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Gold Credits</span>
          </div>

          <div className="h-9 w-[1px] bg-cyan-900/60 hidden sm:block" />

          {/* Quick Nav Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenMap}
              title="World Map [M]"
              className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase hover:bg-cyan-500 hover:text-black transition-colors"
            >
              [M] MAP
            </button>
            <button
              onClick={onOpenCharacter}
              title="Character & Skills [C]"
              className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase hover:bg-cyan-500 hover:text-black transition-colors"
            >
              [C] HERO
            </button>
            <button
              onClick={onOpenInventory}
              title="Inventory & Forge [I]"
              className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase hover:bg-cyan-500 hover:text-black transition-colors"
            >
              [I] BAG
            </button>
            <button
              onClick={onOpenContracts}
              title="Hunter Contracts [J]"
              className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase hover:bg-cyan-500 hover:text-black transition-colors hidden lg:block"
            >
              [J] GUILD
            </button>
            <button
              onClick={onOpenCodex}
              title="Hunter Codex [K]"
              className="px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/50 text-[10px] text-cyan-300 uppercase hover:bg-cyan-500 hover:text-black transition-colors hidden lg:block"
            >
              [K] CODEX
            </button>
            <button
              onClick={onToggleMute}
              title="Audio Sound Toggle"
              className="px-2 py-1.5 bg-cyan-950/40 border border-cyan-800 text-[10px] text-cyan-400 hover:bg-cyan-900"
            >
              {isMuted ? 'MUTED' : 'AUDIO'}
            </button>
            <button
              onClick={onSaveGame}
              title="Save Game"
              className="px-2 py-1.5 bg-cyan-950/40 border border-cyan-800 text-[10px] text-cyan-400 hover:bg-cyan-900"
            >
              SAVE
            </button>
          </div>
        </div>
      </header>

      {/* BOSS HEALTH BAR (IF ENGAGED) */}
      {activeBoss && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-20 pointer-events-auto">
          <div className="bg-[#05070a]/90 border border-red-800/80 p-3 backdrop-blur-md shadow-[0_0_25px_rgba(239,68,68,0.3)]">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
                  ⚠ {activeBoss.def.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-red-950 border border-red-700 text-red-300">
                  PHASE {activeBoss.currentPhase} / {activeBoss.def.phases || 1}
                </span>
              </div>
              <span className="text-[11px] font-bold text-red-200">
                {Math.max(0, activeBoss.health)} / {activeBoss.maxHealth}
              </span>
            </div>
            <div className="w-full h-3 bg-red-950 border border-red-900 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-100 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                style={{ width: `${Math.max(0, (activeBoss.health / activeBoss.maxHealth) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-red-400 mt-1 uppercase">
              <span>Weakness: {activeBoss.def.weakness}</span>
              <span>{activeBoss.def.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* CENTER HUD: LEFT AND RIGHT TACTICAL FLANKS */}
      <div className="flex-1 flex justify-between items-start px-6 pt-6 pointer-events-none">
        {/* LEFT FLANK: MISSION OBJECTIVES & RADAR SIGNALS */}
        <div className="w-68 space-y-3 pointer-events-auto hidden md:block">
          {/* Mission Objectives / Contracts */}
          <div className="bg-cyan-950/30 border border-cyan-900/80 p-3 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <h3 className="text-xs font-bold text-cyan-400 mb-2 border-b border-cyan-900/60 pb-1 uppercase tracking-wider flex justify-between">
              <span>Hunt Contracts</span>
              <span className="text-[10px] text-cyan-600">[J]</span>
            </h3>
            <div className="space-y-2 text-[11px]">
              {char.contracts.slice(0, 2).map((con) => (
                <div key={con.id} className="border border-cyan-900/40 p-2 bg-black/40">
                  <div className="flex items-start gap-2 text-cyan-100 font-medium">
                    <div
                      className={`w-2 h-2 mt-1 ${
                        con.completed ? 'bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-cyan-400'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>{con.title}</span>
                        <span className={con.completed ? 'text-green-400' : 'text-cyan-400'}>
                          {con.currentCount}/{con.targetCount}
                        </span>
                      </div>
                      <div className="text-[9px] text-cyan-600 mt-0.5">
                        +{con.rewards.xp} XP // +{con.rewards.gold} Gold
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Beast Contacts */}
          <div className="bg-[#05070a]/60 border border-cyan-900/80 p-3 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-cyan-400 mb-2 border-b border-cyan-900/60 pb-1 uppercase tracking-wider">
              Sensor Radar Contacts
            </h3>
            <div className="space-y-1.5">
              {radarContacts.length === 0 ? (
                <div className="text-[10px] text-cyan-700">No beast signatures nearby</div>
              ) : (
                radarContacts.map((c, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] items-center">
                    <span className={c.isBoss ? 'text-red-400 font-bold' : c.isElite ? 'text-amber-400' : 'text-cyan-300'}>
                      [{c.threat}] {c.name}
                    </span>
                    <span className="text-cyan-600">{c.distMeters}m</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT FLANK: TACTICAL RADAR MINIMAP & POTIONS */}
        <div className="w-64 space-y-3 pointer-events-auto hidden sm:block">
          {/* Minimap */}
          <div className="bg-cyan-950/30 border border-cyan-900/80 p-3 backdrop-blur-sm">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-400 mb-2 border-b border-cyan-900/60 pb-1 uppercase tracking-wider">
              <span>Tactical Grid</span>
              <span className="text-[9px] text-cyan-600">POS: {Math.floor(world.playerX)}// {Math.floor(world.playerY)}</span>
            </div>

            <div className="w-full h-36 relative overflow-hidden bg-black/60 border border-cyan-950">
              {/* Radar Grid overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundSize: '20px 20px',
                  backgroundImage:
                    'linear-gradient(to right, #0a1118 1px, transparent 1px), linear-gradient(to bottom, #0a1118 1px, transparent 1px)',
                }}
              />

              {/* Radar concentric range circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-cyan-500/20 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-cyan-500/30 rounded-full" />

              {/* Center Player Blip */}
              <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#4df2ff]" />

              {/* Camp Icon Blip */}
              {(() => {
                const relX = ((world.camp.x - world.playerX) / 1200) * 128 + 64;
                const relY = ((world.camp.y - world.playerY) / 1200) * 72 + 72;
                if (relX >= 0 && relX <= 220 && relY >= 0 && relY <= 140) {
                  return (
                    <div
                      className="absolute w-2.5 h-2.5 bg-amber-400 border border-amber-200 rotate-45 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${relX}px`, top: `${relY}px` }}
                      title="Campfire"
                    />
                  );
                }
                return null;
              })()}

              {/* Monster Blips */}
              {world.monsters.map((m) => {
                if (m.health <= 0) return null;
                const relX = ((m.x - world.playerX) / 1200) * 128 + 128;
                const relY = ((m.y - world.playerY) / 1200) * 72 + 72;
                if (relX < 0 || relX > 256 || relY < 0 || relY > 144) return null;

                return (
                  <div
                    key={m.id}
                    className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
                      m.isBoss
                        ? 'w-2.5 h-2.5 bg-red-500 shadow-[0_0_8px_red] animate-pulse'
                        : m.isElite
                        ? 'w-2 h-2 bg-amber-400'
                        : 'w-1.5 h-1.5 bg-red-400/80'
                    }`}
                    style={{ left: `${relX}px`, top: `${relY}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Consumables & Hunter Sense */}
          <div className="bg-[#05070a]/60 border border-cyan-900/80 p-3 backdrop-blur-sm flex justify-between items-center">
            <button
              onClick={() => onTriggerPotion('health')}
              className="flex flex-col items-center p-1.5 bg-cyan-950/40 border border-cyan-800 hover:border-cyan-400 transition-colors"
            >
              <span className="text-[9px] text-cyan-600">[1] HEALTH</span>
              <span className="text-xs font-bold text-green-400">🧪 x{char.potions.health}</span>
            </button>

            <button
              onClick={() => onTriggerPotion('stamina')}
              className="flex flex-col items-center p-1.5 bg-cyan-950/40 border border-cyan-800 hover:border-cyan-400 transition-colors"
            >
              <span className="text-[9px] text-cyan-600">[2] STAMINA</span>
              <span className="text-xs font-bold text-amber-400">⚡ x{char.potions.stamina}</span>
            </button>

            <button
              onClick={onTriggerHunterSense}
              className={`flex flex-col items-center p-1.5 border transition-all ${
                world.hunterSenseActive
                  ? 'bg-cyan-500 border-cyan-300 text-black animate-pulse'
                  : 'bg-cyan-950/40 border-cyan-800 text-cyan-300 hover:border-cyan-400'
              }`}
            >
              <span className="text-[9px] uppercase">[T] SENSE</span>
              <span className="text-xs font-bold">👁️ {world.hunterSenseActive ? 'ACTIVE' : 'TRACK'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM COMMAND DOCK - ABILITIES, CONTROLS & GAUGES */}
      <footer className="w-full pb-5 px-6 flex flex-col items-center pointer-events-auto z-20">
        {/* Experience Bar */}
        <div className="w-full max-w-2xl flex items-center gap-3 mb-3">
          <span className="text-[10px] text-cyan-600 uppercase tracking-wider">XP LEVEL {char.level}</span>
          <div className="flex-1 h-1.5 bg-cyan-950 border border-cyan-900 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-200 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ width: `${xpFrac * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-400">
            {char.xp} / {char.nextXp}
          </span>
        </div>

        {/* Ability Hotbar Dock */}
        <div className="bg-[#05070a]/90 border border-cyan-900/80 backdrop-blur-md p-3 px-6 flex items-center gap-3 sm:gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          {/* Attack Action */}
          <button
            onClick={onTriggerAttack}
            className="flex flex-col items-center justify-center w-14 h-14 bg-cyan-950/40 border border-cyan-500/60 hover:bg-cyan-500 hover:text-black transition-colors"
          >
            <span className="text-[9px] text-cyan-400 uppercase font-bold">L-CLICK</span>
            <span className="text-base font-bold">⚔️</span>
            <span className="text-[8px] uppercase">STRIKE</span>
          </button>

          {/* Dodge Action */}
          <button
            onClick={onTriggerDodge}
            disabled={world.dodgeCooldown > 0 || char.stats.stamina < 20}
            className={`relative flex flex-col items-center justify-center w-14 h-14 border transition-colors ${
              world.dodgeCooldown > 0 || char.stats.stamina < 20
                ? 'bg-slate-900/80 border-slate-700 text-slate-500'
                : 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 hover:bg-cyan-500 hover:text-black'
            }`}
          >
            {world.dodgeCooldown > 0 && (
              <div
                className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-cyan-400"
              >
                {world.dodgeCooldown.toFixed(1)}s
              </div>
            )}
            <span className="text-[9px] text-cyan-400 uppercase font-bold">SPACE</span>
            <span className="text-base font-bold">💨</span>
            <span className="text-[8px] uppercase">DODGE</span>
          </button>

          <div className="h-10 w-[1px] bg-cyan-900" />

          {/* Skills Q, W, E, R */}
          {(['Q', 'W', 'E', 'R'] as const).map((key) => {
            const skillId = char.activeSkills[key];
            const def = SKILL_DEFINITIONS[skillId];
            const cd = world.skillCooldowns[key];
            const hasStamina = def && char.stats.stamina >= def.staminaCost;

            return (
              <button
                key={key}
                onClick={() => onTriggerSkill(key)}
                disabled={cd > 0 || !hasStamina}
                title={def ? `${def.name} (${def.staminaCost} Stamina): ${def.description}` : ''}
                className={`relative flex flex-col items-center justify-center w-14 h-14 border transition-all ${
                  cd > 0 || !hasStamina
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500'
                    : key === 'R'
                    ? 'bg-orange-950/30 border-orange-500/80 text-orange-200 hover:bg-orange-500 hover:text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-cyan-950/40 border-cyan-500/60 text-cyan-100 hover:bg-cyan-500 hover:text-black'
                }`}
              >
                {cd > 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold text-cyan-400">
                    {cd.toFixed(1)}s
                  </div>
                )}
                <span className="text-[9px] font-bold uppercase">{key}</span>
                <span className="text-lg">{def ? def.icon : '•'}</span>
                <span className="text-[8px] text-cyan-500">{def ? `${def.staminaCost}s` : ''}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
