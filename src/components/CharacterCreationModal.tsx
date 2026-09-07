import React, { useState } from 'react';
import { ArchetypeId } from '../types';
import { ARCHETYPE_INFO } from '../data/skills';

interface CharacterCreationModalProps {
  onCreate: (name: string, archetype: ArchetypeId) => void;
}

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({ onCreate }) => {
  const [name, setName] = useState('Valen');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId>('ranger');

  const selectedInfo = ARCHETYPE_INFO[selectedArchetype];

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a] flex items-center justify-center p-4 select-none font-mono">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4df2ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-3xl bg-[#05070a] border border-cyan-500/50 p-6 md:p-8 flex flex-col shadow-[0_0_60px_rgba(34,211,238,0.2)]">
        {/* Header */}
        <div className="border-b border-cyan-900/80 pb-4 mb-6 text-center">
          <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Initialization Protocol</span>
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-100 tracking-wider mt-1">
            BEASTBOUND // WILDS OF ELARIA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create your Hunter and venture into 100 unexplored regions across 10 biomes.
          </p>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* Hunter Name Input */}
          <div>
            <label className="text-[10px] text-cyan-500 uppercase tracking-widest block mb-1">
              Hunter Call-Sign / Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full bg-cyan-950/40 border border-cyan-800 px-4 py-2.5 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-bold"
              placeholder="Enter Hunter Name..."
            />
          </div>

          {/* Archetype Selector */}
          <div>
            <label className="text-[10px] text-cyan-500 uppercase tracking-widest block mb-2">
              Select Starting Combat Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(Object.keys(ARCHETYPE_INFO) as ArchetypeId[]).map((arch) => {
                const info = ARCHETYPE_INFO[arch];
                const isSelected = selectedArchetype === arch;

                return (
                  <button
                    key={arch}
                    type="button"
                    onClick={() => setSelectedArchetype(arch)}
                    className={`p-3 border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                        : 'border-cyan-900/60 bg-black/40 hover:border-cyan-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-cyan-100">{info.name}</div>
                    <div className="text-[9px] text-cyan-600 uppercase mt-0.5">{info.primaryStat.split('&')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Archetype Details */}
          <div className="p-4 border border-cyan-900/80 bg-cyan-950/20 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-1">
              <span className="font-bold text-cyan-200">{selectedInfo.title}</span>
              <span className="text-amber-400 font-bold uppercase">{selectedInfo.primaryStat}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{selectedInfo.description}</p>
            <div className="text-[10px] text-cyan-500 pt-1">
              Initial Loadout: {selectedInfo.defaultWeaponId.replace('_', ' ').toUpperCase()} • PELT-LINED TUNIC • TRACKER BOOTS
            </div>
          </div>
        </div>

        {/* Footer Submit */}
        <div className="mt-8 pt-4 border-t border-cyan-900/80 flex justify-end">
          <button
            type="button"
            onClick={() => onCreate(name, selectedArchetype)}
            className="w-full sm:w-auto px-8 py-3 bg-cyan-500 border border-cyan-300 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all"
          >
            ENTER THE WILDS OF ELARIA ➔
          </button>
        </div>
      </div>
    </div>
  );
};
