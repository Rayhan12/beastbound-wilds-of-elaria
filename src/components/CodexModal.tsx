import React, { useState } from 'react';
import { HunterCharacter } from '../types';
import { MONSTER_DEFINITIONS } from '../data/monsters';

interface CodexModalProps {
  char: HunterCharacter;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ char, onClose }) => {
  const [activeTab, setActiveTab] = useState<'codex' | 'trophies'>('codex');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>('forest_wolf');

  const selectedDef = MONSTER_DEFINITIONS[selectedMonsterId] || MONSTER_DEFINITIONS['forest_wolf'];
  const codexRecord = char.codex[selectedMonsterId];

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#05070a] border border-cyan-900 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-cyan-900/60 px-6 flex items-center justify-between bg-cyan-950/20">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-cyan-100 tracking-wider">
              BEAST CATALOG // HUNTER’S CODEX & LODGE
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('codex')}
                className={`px-3 py-1 text-xs uppercase border transition-all ${
                  activeTab === 'codex'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'border-cyan-900/60 text-cyan-600 hover:text-cyan-400'
                }`}
              >
                Hunter Codex
              </button>
              <button
                onClick={() => setActiveTab('trophies')}
                className={`px-3 py-1 text-xs uppercase border transition-all ${
                  activeTab === 'trophies'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'border-cyan-900/60 text-cyan-600 hover:text-cyan-400'
                }`}
              >
                Boss Trophy Room ({char.trophies.length})
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950/60 border border-cyan-600 text-xs text-cyan-300 hover:bg-cyan-500 hover:text-black uppercase"
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Content */}
        {activeTab === 'codex' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">
            {/* Monster List */}
            <div className="w-full md:w-80 overflow-y-auto space-y-2 pr-2 border-r border-cyan-900/60">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Discovered Species</span>
              {Object.values(MONSTER_DEFINITIONS).map((m) => {
                const isSelected = selectedMonsterId === m.id;
                const rec = char.codex[m.id];
                const kills = rec ? rec.killCount : 0;

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonsterId(m.id)}
                    className={`w-full text-left p-2.5 border transition-all flex justify-between items-center ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'border-cyan-900/60 bg-black/40 text-slate-300 hover:border-cyan-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] text-cyan-600 uppercase">{m.biome}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 border border-cyan-900 text-cyan-400">
                      {kills} KILLS
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Beast Telemetry Inspector */}
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="border-b border-cyan-900/60 pb-3">
                <span className="text-[10px] text-cyan-600 uppercase tracking-widest">
                  BEAST ARCHETYPE // {selectedDef.biome.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-cyan-100">{selectedDef.name}</h2>
                <div className="text-xs text-amber-400 mt-1">{selectedDef.title || 'Wild Beast'}</div>
              </div>

              {/* Combat Weakness / Resistance Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-red-900/60 bg-red-950/10">
                  <div className="text-[10px] text-red-400 uppercase font-bold">Elemental Weakness</div>
                  <div className="text-sm font-bold text-red-200 mt-1">
                    🔥 {selectedDef.weakness.toUpperCase()} (+50% DMG)
                  </div>
                </div>

                <div className="p-3 border border-cyan-900/60 bg-cyan-950/10">
                  <div className="text-[10px] text-cyan-400 uppercase font-bold">Elemental Resistance</div>
                  <div className="text-sm font-bold text-cyan-200 mt-1">
                    🛡️ {selectedDef.resistance.toUpperCase()} (-40% DMG)
                  </div>
                </div>
              </div>

              {/* Stats & Behaviors */}
              <div className="p-4 border border-cyan-900/60 bg-black/40 space-y-2 text-xs">
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Base Health</span>
                  <span className="text-cyan-200 font-bold">{selectedDef.health} HP</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Attack Rating</span>
                  <span className="text-white font-bold">{selectedDef.attack}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Natural Armor</span>
                  <span className="text-white font-bold">{selectedDef.defense}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Predator Behaviors</span>
                  <span className="text-amber-300 uppercase">{selectedDef.behaviors.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lifetime Hunts Completed</span>
                  <span className="text-green-400 font-bold">{codexRecord?.killCount || 0} Slain</span>
                </div>
              </div>

              {/* Harvest Drops */}
              <div>
                <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Known Harvesting Yields</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {selectedDef.drops.map((d, i) => (
                    <div key={i} className="p-2 border border-cyan-900/60 bg-black/50 text-xs flex items-center gap-2">
                      <span className="text-xl">{d.item.icon}</span>
                      <div>
                        <div className="font-bold text-cyan-200">{d.item.name}</div>
                        <div className="text-[10px] text-slate-400">{Math.floor(d.chance * 100)}% Drop Chance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Trophies Room */
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Hunter’s Lodge Mounted Boss Trophies
            </h2>
            {char.trophies.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-16 text-center">
                No boss trophies mounted yet. Defeat Regional Bosses (such as The Elderfang at Region 10) to earn legendary trophies for your lodge!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {char.trophies.map((trophy, idx) => (
                  <div key={idx} className="p-4 border border-amber-500/60 bg-amber-950/20 flex flex-col items-center text-center">
                    <span className="text-4xl mb-2">🏆</span>
                    <div className="font-bold text-amber-200 text-sm">{trophy}</div>
                    <div className="text-[10px] text-amber-400 mt-1 uppercase">Mounted Apex Trophy</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
