import React, { useState } from 'react';
import { BiomeId, RegionInfo } from '../types';
import { ALL_REGIONS, BIOMES } from '../data/biomes';

interface WorldMapModalProps {
  currentRegionId: number;
  discoveredRegions: number[];
  discoveredCamps: number[];
  onSelectRegion: (regionId: number) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  currentRegionId,
  discoveredRegions,
  discoveredCamps,
  onSelectRegion,
  onClose,
}) => {
  const [selectedBiome, setSelectedBiome] = useState<BiomeId>('greenwild');
  const [inspectedRegionId, setInspectedRegionId] = useState<number>(currentRegionId);

  const inspectedRegion = ALL_REGIONS.find((r) => r.id === inspectedRegionId) || ALL_REGIONS[0];
  const biomeMeta = BIOMES[inspectedRegion.biome];

  const biomeRegions = ALL_REGIONS.filter((r) => r.biome === selectedBiome);

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      {/* Background grid overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4df2ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-5xl h-[88vh] bg-[#05070a] border border-cyan-900 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-cyan-900/60 px-6 flex items-center justify-between bg-cyan-950/20">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-cyan-100 tracking-wider">ELARIA SECTOR MAP // 100 REGIONS</span>
            <span className="text-xs px-2 py-0.5 border border-cyan-700 bg-cyan-950 text-cyan-400">
              DISCOVERED: {discoveredRegions.length}/100
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950/60 border border-cyan-600 text-xs text-cyan-300 hover:bg-cyan-500 hover:text-black uppercase"
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Biome Selector Tabs */}
        <div className="flex overflow-x-auto border-b border-cyan-900/40 bg-black/40 px-4 py-2 gap-2 text-xs scrollbar-none">
          {Object.values(BIOMES).map((b) => {
            const isSelected = selectedBiome === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBiome(b.id);
                  const firstOfBiome = ALL_REGIONS.find((r) => r.biome === b.id);
                  if (firstOfBiome) setInspectedRegionId(firstOfBiome.id);
                }}
                className={`px-3 py-1.5 whitespace-nowrap border text-[11px] uppercase transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : 'border-cyan-900/60 text-cyan-600 hover:text-cyan-300'
                }`}
              >
                {b.name} [{b.regionRange[0]}-{b.regionRange[1]}]
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Region Grid (Left/Center) */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                {BIOMES[selectedBiome].name} Territories
              </h2>
              <p className="text-xs text-slate-400 mt-1">{BIOMES[selectedBiome].description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {biomeRegions.map((reg) => {
                const isDiscovered = discoveredRegions.includes(reg.id) || reg.id <= currentRegionId + 1;
                const isCurrent = reg.id === currentRegionId;
                const isInspected = reg.id === inspectedRegionId;
                const hasCamp = discoveredCamps.includes(reg.id);
                const isBoss = reg.id % 10 === 0;

                return (
                  <div
                    key={reg.id}
                    onClick={() => setInspectedRegionId(reg.id)}
                    className={`relative p-3 border cursor-pointer transition-all ${
                      isInspected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : isCurrent
                        ? 'border-amber-400 bg-amber-950/20'
                        : 'border-cyan-900/60 bg-black/40 hover:border-cyan-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-cyan-600 mb-1">
                      <span>R-{reg.id.toString().padStart(2, '0')}</span>
                      {hasCamp && <span className="text-amber-400">⛺ CAMP</span>}
                      {isBoss && <span className="text-red-400">👑 APEX</span>}
                    </div>

                    <div className="text-xs font-bold text-slate-100 truncate">
                      {isDiscovered ? reg.name : 'Unknown Territory'}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1">
                      LVL {reg.minLevel}-{reg.maxLevel}
                    </div>

                    {isCurrent && (
                      <div className="mt-2 text-[9px] px-1.5 py-0.5 bg-amber-500/20 border border-amber-500 text-amber-300 text-center uppercase">
                        CURRENT LOCATION
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Region Details Inspector (Right Panel) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-900/60 p-6 bg-cyan-950/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-cyan-900/60 pb-3">
                <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Selected Territory</span>
                <h3 className="text-lg font-bold text-cyan-100">{inspectedRegion.name}</h3>
                <span className="text-xs text-cyan-400">
                  Region {inspectedRegion.id} // {biomeMeta.name}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Danger Rating</span>
                  <span className="text-amber-400 font-bold">
                    Level {inspectedRegion.minLevel} - {inspectedRegion.maxLevel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Element Affinity</span>
                  <span className="text-cyan-300">{biomeMeta.elementFocus}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Regional Ruler</span>
                  <span className="text-red-400 font-bold">{inspectedRegion.bossName}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span className="text-slate-400">Hunter Camp Status</span>
                  <span className={discoveredCamps.includes(inspectedRegion.id) ? 'text-green-400' : 'text-slate-500'}>
                    {discoveredCamps.includes(inspectedRegion.id) ? 'ESTABLISHED' : 'UNEXPLORED'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 border border-cyan-900/40">
                {inspectedRegion.description}
              </p>
            </div>

            {/* Travel Action */}
            <div className="pt-4">
              {inspectedRegion.id === currentRegionId ? (
                <div className="w-full py-2.5 bg-cyan-950 border border-cyan-700 text-cyan-400 text-xs text-center uppercase">
                  Already in this region
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSelectRegion(inspectedRegion.id);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-cyan-600 border border-cyan-400 text-black text-xs font-bold uppercase hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                >
                  🚀 TRAVEL TO REGION {inspectedRegion.id}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
