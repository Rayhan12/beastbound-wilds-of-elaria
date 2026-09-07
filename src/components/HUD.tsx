import React from 'react';
import { HunterCharacter, RegionInfo } from '../types';
import { GameWorldState } from '../game/gameLoop';
import { SKILL_DEFINITIONS } from '../data/skills';
import { BIOMES } from '../data/biomes';
import {
  Shield,
  Zap,
  Eye,
  Map as MapIcon,
  User,
  Package,
  Scroll,
  BookOpen,
  Volume2,
  VolumeX,
  Crosshair,
  Compass,
  Sun,
  Moon,
  Sparkles,
  Award,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  char: HunterCharacter;
  world: GameWorldState;
  region: RegionInfo;
  onOpenMap: () => void;
  onOpenCharacter: () => void;
  onOpenInventory: () => void;
  onOpenGuild: () => void;
  onOpenCodex: () => void;
  onFastTravelToCamp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  char,
  world,
  region,
  onOpenMap,
  onOpenCharacter,
  onOpenInventory,
  onOpenGuild,
  onOpenCodex,
  onFastTravelToCamp,
  isMuted,
  onToggleMute,
}) => {
  const biome = BIOMES[region.biome];
  const hpPercent = Math.max(0, Math.min(100, (char.stats.health / char.stats.maxHealth) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (char.stats.stamina / char.stats.maxStamina) * 100));
  const xpPercent = Math.max(0, Math.min(100, (char.xp / char.nextXp) * 100));

  const isNight = world.gameTimeHours < 6 || world.gameTimeHours > 20;

  // Find if a boss is nearby and alive
  const activeBoss = world.monsters.find(
    (m) => m.isBoss && m.health > 0 && Math.hypot(m.x - world.playerX, m.y - world.playerY) < 700
  );

  return (
    <div id="game-hud-overlay" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between">
        {/* Top Left: Player Status Vitals */}
        <div className="pointer-events-auto flex items-start gap-3">
          <div className="relative flex flex-col gap-1 rounded-xl border border-slate-700/80 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md">
            {/* Hunter Title and Level */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {char.archetype === 'vanguard' ? '🛡️' :
                   char.archetype === 'ranger' ? '🏹' :
                   char.archetype === 'arcanist' ? '🔮' :
                   char.archetype === 'beastmaster' ? '🐺' : '🗡️'}
                </span>
                <div>
                  <div className="font-cinzel text-sm font-bold tracking-wide text-amber-300">
                    {char.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 capitalize">
                    Lvl {char.level} • {char.archetype}
                  </div>
                </div>
              </div>

              {/* Gold and Guild Rep */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-semibold text-amber-400">
                  <span>🪙</span>
                  <span>{char.gold}</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-slate-300">
                  <Award className="h-3.5 w-3.5 text-blue-400" />
                  <span>Rank {char.guildRank}</span>
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mt-1 w-56">
              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                <span className="text-red-400">HEALTH</span>
                <span>{Math.floor(char.stats.health)} / {char.stats.maxHealth}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-red-950/60 bg-red-950/40 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="w-56">
              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                <span className="text-emerald-400">STAMINA</span>
                <span>{Math.floor(char.stats.stamina)} / {char.stats.maxStamina}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-emerald-950/60 bg-emerald-950/40 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-100"
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-56">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>XP</span>
                <span>{char.xp} / {char.nextXp}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-200"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Center: Boss Health Bar if Engaged */}
        {activeBoss && (
          <div className="pointer-events-auto flex flex-col items-center animate-fade-in">
            <div className="flex w-96 flex-col items-center rounded-xl border border-red-500/50 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 font-cinzel text-base font-bold text-red-400">
                <span>👑</span>
                <span>{activeBoss.def.title || activeBoss.def.name}</span>
              </div>
              <div className="text-xs text-amber-400">
                Phase {activeBoss.currentPhase} of {activeBoss.def.phases || 1} • {activeBoss.def.element.toUpperCase()}
              </div>
              <div className="mt-2 h-4 w-full overflow-hidden rounded-full border border-red-900 bg-red-950/80 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 transition-all duration-150"
                  style={{ width: `${Math.max(0, (activeBoss.health / activeBoss.maxHealth) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] font-semibold text-slate-300">
                {activeBoss.health} / {activeBoss.maxHealth} HP
              </div>
            </div>
          </div>
        )}

        {/* Top Right: Region Info & Minimap */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Region Badge & Time */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-1.5 text-xs shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-1 text-slate-400">
              {isNight ? <Moon className="h-3.5 w-3.5 text-indigo-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              <span>{Math.floor(world.gameTimeHours)}:00</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="font-cinzel font-bold text-amber-300">
              Region {region.id}: {region.name}
            </div>
            <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              Lvl {region.minLevel}-{region.maxLevel}
            </span>
          </div>

          {/* Circular Minimap */}
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-950/90 shadow-xl">
            {/* Minimap Radar representation */}
            <div className="absolute inset-0 bg-slate-900/60" />
            {/* Center Player dot */}
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-500 shadow-md" />

            {/* Camp marker on minimap */}
            {(() => {
              const dx = (world.camp.x - world.playerX) / 20;
              const dy = (world.camp.y - world.playerY) / 20;
              const px = 56 + dx;
              const py = 56 + dy;
              if (px >= 5 && px <= 107 && py >= 5 && py <= 107) {
                return (
                  <div
                    className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 text-[8px] flex items-center justify-center font-bold text-slate-950"
                    style={{ left: `${px}px`, top: `${py}px` }}
                    title="Hunter Camp"
                  >
                    ⛺
                  </div>
                );
              }
              return null;
            })()}

            {/* Nearby Beast blips */}
            {world.monsters.map((m) => {
              if (m.health <= 0) return null;
              const dx = (m.x - world.playerX) / 20;
              const dy = (m.y - world.playerY) / 20;
              const px = 56 + dx;
              const py = 56 + dy;
              if (px < 4 || px > 108 || py < 4 || py > 108) return null;
              return (
                <div
                  key={m.id}
                  className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    m.isBoss ? 'h-3 w-3 bg-red-500 animate-pulse' : m.isElite ? 'bg-amber-400' : 'bg-red-400/80'
                  }`}
                  style={{ left: `${px}px`, top: `${py}px` }}
                />
              );
            })}

            {/* Compass rose */}
            <div className="absolute right-1 top-1 text-[9px] font-bold text-slate-400">N</div>
          </div>

          {/* Quick Nav Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenMap}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-amber-300"
              title="Open 100-Region World Map [M]"
            >
              <MapIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>Map [M]</span>
            </button>
            <button
              onClick={onOpenCharacter}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-amber-300"
              title="Character & Skills [C]"
            >
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Hero [C]</span>
            </button>
            <button
              onClick={onOpenInventory}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-amber-300"
              title="Inventory & Forge [I]"
            >
              <Package className="h-3.5 w-3.5 text-amber-400" />
              <span>Forge [I]</span>
            </button>
            <button
              onClick={onOpenGuild}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-amber-300"
              title="Hunter Guild & Contracts [J]"
            >
              <Scroll className="h-3.5 w-3.5 text-indigo-400" />
              <span>Bounties [J]</span>
            </button>
            <button
              onClick={onOpenCodex}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-amber-300"
              title="Hunter Codex & Trophies [K]"
            >
              <BookOpen className="h-3.5 w-3.5 text-rose-400" />
              <span>Codex [K]</span>
            </button>
            <button
              onClick={onToggleMute}
              className="rounded-lg border border-slate-700 bg-slate-900/90 p-1.5 text-slate-300 transition hover:bg-slate-800"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Left: Active Quest Tracker */}
      <div className="pointer-events-auto max-w-xs self-start rounded-xl border border-slate-800/80 bg-slate-950/75 p-2.5 text-xs shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-cinzel text-[11px] font-bold text-amber-400">HUNT CONTRACTS</span>
          <span className="text-[10px] text-slate-500">Press J</span>
        </div>
        <div className="mt-1 flex flex-col gap-1.5">
          {char.contracts.slice(0, 2).map((con) => (
            <div key={con.id} className="rounded bg-slate-900/70 p-1.5">
              <div className="flex justify-between font-medium text-slate-200">
                <span>{con.title}</span>
                <span className={con.completed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {con.completed ? 'CLAIMABLE' : `${con.currentCount} / ${con.targetCount}`}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">{con.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Action Hotbar & Controls */}
      <div className="pointer-events-auto flex items-end justify-between">
        {/* Potions & Return to Camp */}
        <div className="flex items-center gap-2">
          {/* Health Potion [1] */}
          <button
            onClick={() => {
              if (char.potions.health > 0 && char.stats.health < char.stats.maxHealth) {
                char.potions.health -= 1;
                char.stats.health = Math.min(char.stats.maxHealth, char.stats.health + 350);
                soundEngine.playPotion();
              }
            }}
            className="group relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-red-800/60 bg-slate-950/90 shadow-lg transition hover:border-red-500"
          >
            <span className="text-xl">🧪</span>
            <span className="absolute bottom-1 right-1 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {char.potions.health}
            </span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1 text-[9px] font-bold text-slate-300">
              [1]
            </span>
          </button>

          {/* Stamina Potion [2] */}
          <button
            onClick={() => {
              if (char.potions.stamina > 0 && char.stats.stamina < char.stats.maxStamina) {
                char.potions.stamina -= 1;
                char.stats.stamina = Math.min(char.stats.maxStamina, char.stats.stamina + 150);
                soundEngine.playPotion();
              }
            }}
            className="group relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-emerald-800/60 bg-slate-950/90 shadow-lg transition hover:border-emerald-500"
          >
            <span className="text-xl">⚡</span>
            <span className="absolute bottom-1 right-1 rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
              {char.potions.stamina}
            </span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1 text-[9px] font-bold text-slate-300">
              [2]
            </span>
          </button>

          {/* Hunter Sense [T] */}
          <button
            onClick={() => {
              world.hunterSenseActive = true;
              world.hunterSenseTimer = 8.0;
              soundEngine.playTrackFound();
            }}
            className={`group relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border ${
              world.hunterSenseActive ? 'border-cyan-400 bg-cyan-950/70' : 'border-slate-700 bg-slate-950/90'
            } shadow-lg transition hover:border-cyan-400`}
          >
            <Eye className={`h-6 w-6 ${world.hunterSenseActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[9px] font-bold text-cyan-300">SENSE</span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1 text-[9px] font-bold text-slate-300">
              [T]
            </span>
          </button>

          {/* Quick Return to Camp [B] */}
          <button
            onClick={onFastTravelToCamp}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-amber-700/60 bg-slate-950/90 shadow-lg transition hover:border-amber-400"
            title="Fast Travel back to Camp [B]"
          >
            <span className="text-xl">⛺</span>
            <span className="text-[9px] font-bold text-amber-300">CAMP</span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1 text-[9px] font-bold text-slate-300">
              [B]
            </span>
          </button>
        </div>

        {/* Center: Skill Hotbar (Attack, Dodge, Q, W, E, R) */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-md">
          {/* Primary Attack (LMB) */}
          <div className="relative flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900">
            <span className="text-2xl">
              {char.archetype === 'ranger' ? '🏹' : char.archetype === 'arcanist' ? '🔮' : '⚔️'}
            </span>
            <span className="text-[9px] font-bold text-slate-400">ATTACK</span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 text-[9px] font-bold text-amber-400">
              LMB
            </span>
          </div>

          {/* Dodge Roll (Space / RMB) */}
          <div className="relative flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900">
            <span className="text-2xl">💨</span>
            <span className="text-[9px] font-bold text-slate-400">DODGE</span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 text-[9px] font-bold text-cyan-400">
              SPACE
            </span>
            {world.dodgeCooldown > 0 && (
              <div
                className="absolute inset-0 rounded-xl bg-slate-950/70 flex items-center justify-center font-bold text-white text-xs"
              >
                {world.dodgeCooldown.toFixed(1)}
              </div>
            )}
          </div>

          {/* Abilities Q, W, E, R */}
          {(['Q', 'W', 'E', 'R'] as const).map((key) => {
            const skillId = char.activeSkills[key];
            const skillDef = SKILL_DEFINITIONS[skillId];
            const cd = world.skillCooldowns[key];
            const isReady = cd <= 0;

            return (
              <div
                key={key}
                className="relative flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900"
                title={skillDef ? `${skillDef.name}: ${skillDef.description}` : ''}
              >
                <span className="text-2xl">{skillDef?.icon || '⭐'}</span>
                <span className="text-[9px] font-bold text-slate-300 truncate max-w-[56px] text-center px-0.5">
                  {skillDef?.name || key}
                </span>

                {/* Key Badge */}
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-amber-500/20 border border-amber-500/60 px-1.5 text-[10px] font-bold text-amber-300">
                  {key}
                </span>

                {/* Cooldown Overlay */}
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/80 font-mono text-sm font-extrabold text-amber-400">
                    {cd.toFixed(1)}s
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Right: Controls Hint */}
        <div className="flex flex-col items-end gap-1 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1 rounded bg-slate-900/80 px-2 py-1">
            <span className="font-bold text-amber-300">WASD</span>
            <span>Move</span>
            <span className="mx-1">•</span>
            <span className="font-bold text-cyan-300">SPACE</span>
            <span>Dodge</span>
            <span className="mx-1">•</span>
            <span className="font-bold text-red-300">LMB</span>
            <span>Attack</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Dodge during enemy windup for <span className="text-amber-400 font-bold">PERFECT DODGE CRIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
