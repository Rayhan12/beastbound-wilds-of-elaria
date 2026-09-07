import React from 'react';
import { HunterCharacter, HuntContract } from '../types';
import { GUILD_RANKS, awardExperience } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';

interface GuildContractsModalProps {
  char: HunterCharacter;
  onUpdateChar: (char: HunterCharacter) => void;
  onClose: () => void;
}

export const GuildContractsModal: React.FC<GuildContractsModalProps> = ({
  char,
  onUpdateChar,
  onClose,
}) => {
  const currentRankName = GUILD_RANKS[char.guildRank - 1] || 'Elarian Champion';
  const nextRankName = GUILD_RANKS[char.guildRank] || 'Max Rank';

  const handleClaimContract = (con: HuntContract) => {
    if (!con.completed || con.claimed) return;

    soundEngine.playLevelUp();
    con.claimed = true;
    char.gold += con.rewards.gold;
    char.guildRep += con.rewards.reputation;

    // Check rank promotion (every 100 rep)
    if (char.guildRep >= char.guildRank * 100 && char.guildRank < 9) {
      char.guildRank += 1;
    }

    if (con.rewards.item) {
      char.inventory.push(con.rewards.item);
    }

    const { updated } = awardExperience(char, con.rewards.xp);
    onUpdateChar({ ...updated });
  };

  const handleAcceptNewContract = (type: 'wolves' | 'spider' | 'alpha') => {
    const newId = `contract_${Date.now()}`;
    let newContract: HuntContract;

    if (type === 'wolves') {
      newContract = {
        id: newId,
        title: 'Culling Forest Wolves',
        targetMonsterName: 'Forest Wolf',
        targetCount: 4,
        currentCount: 0,
        regionId: char.currentRegionId,
        biome: 'greenwild',
        rewards: { xp: 220, gold: 60, reputation: 35 },
        completed: false,
        claimed: false,
        description: 'Packs are roaming too close to the hunter campsite. Slay 4 wolves.',
      };
    } else if (type === 'spider') {
      newContract = {
        id: newId,
        title: 'Venom Extract: Thornweb Spider',
        targetMonsterName: 'Thornweb Spider',
        targetCount: 2,
        currentCount: 0,
        regionId: char.currentRegionId,
        biome: 'greenwild',
        rewards: { xp: 280, gold: 80, reputation: 45 },
        completed: false,
        claimed: false,
        description: 'Gather live venom glands from Thornweb Spiders in the thicket.',
      };
    } else {
      newContract = {
        id: newId,
        title: 'Hunt the Corrupted Alpha',
        targetMonsterName: 'Corrupted Alpha Wolf',
        targetCount: 1,
        currentCount: 0,
        regionId: char.currentRegionId,
        biome: 'greenwild',
        rewards: { xp: 600, gold: 180, reputation: 80 },
        completed: false,
        claimed: false,
        description: 'Track footprint signs and eliminate the blighted packleader.',
      };
    }

    char.contracts.push(newContract);
    soundEngine.playHarvest();
    onUpdateChar({ ...char });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#05070a] border border-cyan-900 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-cyan-900/60 px-6 flex items-center justify-between bg-cyan-950/20">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-cyan-100 tracking-wider">
              ELARIA HUNTER’S GUILD // BOUNTY DISPATCH
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">
          {/* Left: Guild Rank Progression */}
          <div className="w-full md:w-80 space-y-4">
            <div className="p-4 border border-cyan-900/80 bg-cyan-950/20 space-y-3">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Guild Standing</span>
              <div className="text-lg font-bold text-cyan-100">{currentRankName}</div>
              <div className="text-xs text-amber-400">Guild Rank: {char.guildRank} / 9</div>
              <div className="text-xs text-slate-300">Reputation: {char.guildRep} Points</div>

              <div className="pt-2 border-t border-cyan-900/40 text-[11px] text-slate-400">
                Next Rank: <span className="text-cyan-300">{nextRankName}</span> (requires {char.guildRank * 100} Rep)
              </div>
            </div>

            {/* Accept New Contracts */}
            <div className="p-4 border border-cyan-900/80 bg-black/50 space-y-3">
              <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Available Contracts</span>
              <div className="space-y-2">
                <button
                  onClick={() => handleAcceptNewContract('wolves')}
                  className="w-full text-left p-2 border border-cyan-900 bg-cyan-950/30 hover:border-cyan-400 transition-colors text-xs text-cyan-100"
                >
                  <div className="font-bold">+ Culling Forest Wolves</div>
                  <div className="text-[10px] text-cyan-600">Slay 4 wolves // +220 XP</div>
                </button>
                <button
                  onClick={() => handleAcceptNewContract('spider')}
                  className="w-full text-left p-2 border border-cyan-900 bg-cyan-950/30 hover:border-cyan-400 transition-colors text-xs text-cyan-100"
                >
                  <div className="font-bold">+ Thornweb Spider Venom</div>
                  <div className="text-[10px] text-cyan-600">Slay 2 spiders // +280 XP</div>
                </button>
                <button
                  onClick={() => handleAcceptNewContract('alpha')}
                  className="w-full text-left p-2 border border-cyan-900 bg-cyan-950/30 hover:border-cyan-400 transition-colors text-xs text-cyan-100"
                >
                  <div className="font-bold">+ Apex Hunt: Corrupted Alpha</div>
                  <div className="text-[10px] text-cyan-600">Track & slay // +600 XP</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Active Contracts */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            <span className="text-[10px] text-cyan-600 uppercase tracking-widest">Active Hunter Contracts</span>

            {char.contracts.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-12 text-center">
                No active contracts. Accept a contract on the left dispatch terminal.
              </div>
            ) : (
              char.contracts.map((con) => {
                return (
                  <div
                    key={con.id}
                    className={`p-4 border bg-black/60 flex flex-col justify-between ${
                      con.claimed
                        ? 'border-slate-800 opacity-50'
                        : con.completed
                        ? 'border-green-500 bg-green-950/10'
                        : 'border-cyan-900'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-100 text-sm">{con.title}</span>
                          {con.completed && !con.claimed && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-green-900 border border-green-500 text-green-300 font-bold uppercase">
                              COMPLETED
                            </span>
                          )}
                          {con.claimed && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 uppercase">
                              CLAIMED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 my-1 leading-relaxed">{con.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-cyan-300">
                          {con.currentCount} / {con.targetCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-cyan-900/40 text-xs">
                      <div className="text-[11px] text-cyan-600">
                        Rewards: <span className="text-amber-300">+{con.rewards.xp} XP</span> •{' '}
                        <span className="text-amber-400">+{con.rewards.gold} Gold</span> •{' '}
                        <span className="text-cyan-300">+{con.rewards.reputation} Rep</span>
                      </div>

                      {con.completed && !con.claimed && (
                        <button
                          onClick={() => handleClaimContract(con)}
                          className="px-4 py-1.5 bg-green-500 border border-green-300 text-black text-xs font-bold uppercase hover:bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                        >
                          CLAIM BOUNTY
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
