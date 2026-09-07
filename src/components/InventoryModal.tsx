import React, { useState } from 'react';
import { HunterCharacter, Item } from '../types';
import { CRAFTING_RECIPES } from '../data/items';
import { recalculateStats } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';

interface InventoryModalProps {
  char: HunterCharacter;
  onUpdateChar: (char: HunterCharacter) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ char, onUpdateChar, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting'>('inventory');
  const [selectedItem, setSelectedItem] = useState<Item | null>(char.inventory[0] || null);

  const handleEquip = (item: Item) => {
    if (!item.slot) return;
    const currentEquipped = char.equipped[item.slot];

    // Remove from inventory
    const newInventory = char.inventory.filter((it) => it !== item);
    if (currentEquipped) {
      newInventory.push(currentEquipped);
    }

    const updated = {
      ...char,
      equipped: {
        ...char.equipped,
        [item.slot]: item,
      },
      inventory: newInventory,
    };

    soundEngine.playHarvest();
    onUpdateChar(recalculateStats(updated));
    setSelectedItem(null);
  };

  const handleCraft = (recipe: typeof CRAFTING_RECIPES[0]) => {
    // Check gold and materials
    if (char.gold < recipe.goldCost) return;

    for (const req of recipe.requiredMaterials) {
      const found = char.inventory.find((it) => it.id === req.itemId);
      if (!found || (found.stackCount || 1) < req.count) return;
    }

    // Deduct gold
    const updatedGold = char.gold - recipe.goldCost;

    // Deduct materials
    const newInventory = [...char.inventory];
    for (const req of recipe.requiredMaterials) {
      const idx = newInventory.findIndex((it) => it.id === req.itemId);
      if (idx !== -1) {
        const item = newInventory[idx];
        const count = item.stackCount || 1;
        if (count <= req.count) {
          newInventory.splice(idx, 1);
        } else {
          newInventory[idx] = { ...item, stackCount: count - req.count };
        }
      }
    }

    // Add crafted item
    newInventory.push(recipe.resultItem);

    soundEngine.playLevelUp();
    onUpdateChar(
      recalculateStats({
        ...char,
        gold: updatedGold,
        inventory: newInventory,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#05070a] border border-cyan-900 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-cyan-900/60 px-6 flex items-center justify-between bg-cyan-950/20">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-cyan-100 tracking-wider">SUPPLY REPOSITORY // INVENTORY & FORGE</span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1 text-xs uppercase border transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'border-cyan-900/60 text-cyan-600 hover:text-cyan-400'
                }`}
              >
                Inventory ({char.inventory.length})
              </button>
              <button
                onClick={() => setActiveTab('crafting')}
                className={`px-3 py-1 text-xs uppercase border transition-all ${
                  activeTab === 'crafting'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'border-cyan-900/60 text-cyan-600 hover:text-cyan-400'
                }`}
              >
                Blacksmith Forge
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

        {/* Body */}
        {activeTab === 'inventory' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">
            {/* Grid Items */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {char.inventory.map((it, idx) => {
                  const isSelected = selectedItem === it;
                  const rarityBorder =
                    it.rarity === 'legendary' ? 'border-amber-500' :
                    it.rarity === 'epic' ? 'border-purple-500' :
                    it.rarity === 'rare' ? 'border-cyan-400' : 'border-cyan-900/60';

                  return (
                    <div
                      key={`${it.id}_${idx}`}
                      onClick={() => setSelectedItem(it)}
                      className={`relative p-3 border cursor-pointer bg-black/60 flex flex-col items-center justify-center min-h-20 transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                          : `${rarityBorder} hover:border-cyan-600`
                      }`}
                    >
                      <span className="text-2xl">{it.icon}</span>
                      <span className="text-[10px] text-slate-300 truncate w-full text-center mt-1">
                        {it.name}
                      </span>
                      {it.stackCount && it.stackCount > 1 && (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-cyan-400">
                          x{it.stackCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Item Details */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-900/60 pl-0 md:pl-6 flex flex-col justify-between">
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="border-b border-cyan-900/60 pb-3">
                    <div className="text-3xl mb-2">{selectedItem.icon}</div>
                    <h3 className="text-base font-bold text-cyan-100">{selectedItem.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {selectedItem.rarity} {selectedItem.type}
                      </span>
                      {selectedItem.slot && (
                        <span className="text-[10px] uppercase text-cyan-600">[{selectedItem.slot}]</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 border border-cyan-900/40">
                    {selectedItem.description}
                  </p>

                  {/* Stats breakdown */}
                  {selectedItem.stats && (
                    <div className="space-y-1.5 text-xs">
                      {selectedItem.stats.attack && (
                        <div className="flex justify-between text-amber-300">
                          <span>Attack:</span>
                          <span>+{selectedItem.stats.attack}</span>
                        </div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="flex justify-between text-cyan-300">
                          <span>Defense:</span>
                          <span>+{selectedItem.stats.defense}</span>
                        </div>
                      )}
                      {selectedItem.stats.critChance && (
                        <div className="flex justify-between text-amber-400">
                          <span>Crit Chance:</span>
                          <span>+{selectedItem.stats.critChance}%</span>
                        </div>
                      )}
                      {selectedItem.stats.moveSpeed && (
                        <div className="flex justify-between text-slate-300">
                          <span>Move Speed:</span>
                          <span>+{selectedItem.stats.moveSpeed}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legendary Passive */}
                  {selectedItem.passiveDesc && (
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/60 text-[11px] text-amber-200">
                      <span className="font-bold uppercase text-amber-400">Unique Passive: </span>
                      {selectedItem.passiveDesc}
                    </div>
                  )}

                  {/* Actions */}
                  {selectedItem.type === 'equipment' && selectedItem.slot && (
                    <button
                      onClick={() => handleEquip(selectedItem)}
                      className="w-full py-2 bg-cyan-600 border border-cyan-400 text-black text-xs font-bold uppercase hover:bg-cyan-400"
                    >
                      EQUIP ITEM
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-12">
                  Select an item to inspect telemetry data
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Forge / Crafting Tab */
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Hunter’s Forge Crafting Station
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CRAFTING_RECIPES.map((recipe) => {
                const canCraftGold = char.gold >= recipe.goldCost;
                const canCraftMats = recipe.requiredMaterials.every((req) => {
                  const it = char.inventory.find((inv) => inv.id === req.itemId);
                  return it && (it.stackCount || 1) >= req.count;
                });
                const canCraft = canCraftGold && canCraftMats;

                return (
                  <div key={recipe.id} className="p-4 border border-cyan-900 bg-black/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 border-b border-cyan-900/60 pb-2">
                        <span className="text-3xl">{recipe.resultItem.icon}</span>
                        <div>
                          <div className="font-bold text-cyan-100">{recipe.resultItem.name}</div>
                          <div className="text-[10px] text-amber-400 uppercase">{recipe.resultItem.rarity} {recipe.resultItem.type}</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 my-2 leading-relaxed">
                        {recipe.resultItem.description}
                      </p>

                      <div className="space-y-1 my-3 text-xs">
                        <span className="text-[10px] text-cyan-600 uppercase">Required Beast Materials:</span>
                        {recipe.requiredMaterials.map((req) => {
                          const current = char.inventory.find((it) => it.id === req.itemId)?.stackCount || 0;
                          const hasEnough = current >= req.count;
                          return (
                            <div key={req.itemId} className="flex justify-between text-[11px]">
                              <span className={hasEnough ? 'text-slate-300' : 'text-red-400'}>{req.name}</span>
                              <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                                {current} / {req.count}
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-400">Gold Cost:</span>
                          <span className={canCraftGold ? 'text-amber-400' : 'text-red-400'}>
                            {recipe.goldCost} Gold
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCraft(recipe)}
                      disabled={!canCraft}
                      className={`w-full py-2 text-xs font-bold uppercase transition-all ${
                        canCraft
                          ? 'bg-cyan-600 border border-cyan-400 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                          : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      FORGE {recipe.resultItem.name.toUpperCase()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
