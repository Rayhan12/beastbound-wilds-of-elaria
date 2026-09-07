import React from 'react';
import { HunterCharacter } from '../types';
import { ARCHETYPE_INFO, SKILL_DEFINITIONS } from '../data/skills';
import { recalculateStats } from '../game/gameState';

interface CharacterModalProps {
  char: HunterCharacter;
  onUpdateChar: (char: HunterCharacter) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ char, onUpdateChar, onClose }) => {
  const info = ARCHETYPE_INFO[char.archetype];

  const handleAddAttribute = (type: 'health' | 'attack' | 'defense' | 'stamina' | 'speed') => {
    if (char.attributePoints <= 0) return;

    const updated = { ...char, attributePoints: char.attributePoints - 1 };
    if (type === 'health') {
      updated.stats.maxHealth += 35;
      updated.stats.health += 35;
    } else if (type === 'attack') {
      updated.stats.attack += 5;
    } else if (type === 'defense') {
      updated.stats.defense += 4;
    } else if (type === 'stamina') {
      updated.stats.maxStamina += 15;
      updated.stats.stamina += 15;
    } else if (type === 'speed') {
      updated.stats.moveSpeed += 3;
    }
    onUpdateChar(recalculateStats(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#05070a] border border-cyan-900 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-cyan-900/60 px-6 flex items-center justify-between bg-cyan-950/20">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-cyan-100 tracking-wider">HUNTER DOSSIER // STATUS & SKILLS</span>
            <span className="text-xs px-2 py-0.5 border border-cyan-700 bg-cyan-950 text-cyan-400 uppercase">
              RANK: {char.guildRank}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950/60 border border-cyan-600 text-xs text-cyan-300 hover:bg-cyan-500 hover:text-black uppercase"
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto p-6 gap-6">
          {/* Left Column: Hero Overview & Core Stats */}
          <div className="w-full md:w-80 space-y-4">
            {/* Identity Card */}
            <div className="p-4 border border-cyan-900/70 bg-cyan-950/20 space-y-2">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Hunter Identity</span>
              <div className="text-lg font-bold text-cyan-100">{char.name}</div>
              <div className="text-xs text-amber-400 font-bold uppercase">
                {info.name} • {info.title}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{info.description}</div>

              <div className="pt-2 border-t border-cyan-900/40 flex justify-between text-xs text-cyan-400">
                <span>Available Attribute Points:</span>
                <span className="font-bold text-white">{char.attributePoints}</span>
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="p-4 border border-cyan-900/70 bg-black/40 space-y-2.5 text-xs">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Telemetry Attributes</span>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Max Health</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-200">{char.stats.maxHealth}</span>
                  {char.attributePoints > 0 && (
                    <button
                      onClick={() => handleAddAttribute('health')}
                      className="px-1.5 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] hover:bg-cyan-400 hover:text-black"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Max Stamina</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-200">{char.stats.maxStamina}</span>
                  {char.attributePoints > 0 && (
                    <button
                      onClick={() => handleAddAttribute('stamina')}
                      className="px-1.5 bg-orange-900 border border-orange-400 text-orange-200 text-[10px] hover:bg-orange-400 hover:text-black"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Attack Power</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{char.stats.attack}</span>
                  {char.attributePoints > 0 && (
                    <button
                      onClick={() => handleAddAttribute('attack')}
                      className="px-1.5 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] hover:bg-cyan-400 hover:text-black"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Physical Defense</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{char.stats.defense}</span>
                  {char.attributePoints > 0 && (
                    <button
                      onClick={() => handleAddAttribute('defense')}
                      className="px-1.5 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] hover:bg-cyan-400 hover:text-black"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Critical Strike Chance</span>
                <span className="font-bold text-amber-300">{char.stats.critChance}%</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
                <span className="text-slate-300">Critical Multiplier</span>
                <span className="font-bold text-amber-300">{char.stats.critDamage}x</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">Agility Move Speed</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{char.stats.moveSpeed}</span>
                  {char.attributePoints > 0 && (
                    <button
                      onClick={() => handleAddAttribute('speed')}
                      className="px-1.5 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] hover:bg-cyan-400 hover:text-black"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Equipped Gear & Archetype Abilities */}
          <div className="flex-1 space-y-6">
            {/* Equipped Items */}
            <div className="p-4 border border-cyan-900/70 bg-cyan-950/10 space-y-3">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Active Equipment</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {(['weapon', 'chest', 'boots', 'offhand', 'amulet', 'charm'] as const).map((slot) => {
                  const item = char.equipped[slot];
                  return (
                    <div key={slot} className="p-2.5 border border-cyan-900/60 bg-black/60 flex items-start gap-3">
                      <span className="text-2xl">{item ? item.icon : '▫️'}</span>
                      <div className="flex-1 truncate">
                        <div className="text-[9px] text-cyan-600 uppercase">{slot}</div>
                        <div className="font-bold text-cyan-200 truncate">{item ? item.name : 'Empty'}</div>
                        {item && item.stats?.attack && (
                          <div className="text-[10px] text-amber-400">+{item.stats.attack} ATK</div>
                        )}
                        {item && item.stats?.defense && (
                          <div className="text-[10px] text-cyan-400">+{item.stats.defense} DEF</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Archetype Skill Tree Abilities */}
            <div className="p-4 border border-cyan-900/70 bg-cyan-950/10 space-y-3">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">
                Active Tactical Abilities [{char.archetype.toUpperCase()}]
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Q', 'W', 'E', 'R'] as const).map((key) => {
                  const skillId = char.activeSkills[key];
                  const skill = SKILL_DEFINITIONS[skillId];

                  return (
                    <div key={key} className="p-3 border border-cyan-800 bg-black/60 flex items-start gap-3">
                      <div className="w-10 h-10 border border-cyan-500 bg-cyan-950/50 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-cyan-400 font-bold uppercase">{key}</span>
                        <span className="text-base">{skill?.icon || '•'}</span>
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-cyan-100">{skill?.name}</span>
                          <span className="text-[10px] text-orange-400">{skill?.staminaCost} STM</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{skill?.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
