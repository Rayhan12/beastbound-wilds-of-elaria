/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HunterCharacter, RegionInfo, ArchetypeId } from './types';
import {
  createInitialCharacter,
  loadSavedCharacter,
  saveCharacter,
} from './game/gameState';
import { ALL_REGIONS } from './data/biomes';
import { GameWorldState, InputState, initGameWorld } from './game/gameLoop';
import { GameCanvas } from './components/GameCanvas';
import { TacticalHUD } from './components/TacticalHUD';
import { WorldMapModal } from './components/WorldMapModal';
import { CharacterModal } from './components/CharacterModal';
import { InventoryModal } from './components/InventoryModal';
import { GuildContractsModal } from './components/GuildContractsModal';
import { CodexModal } from './components/CodexModal';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [char, setChar] = useState<HunterCharacter>(() => {
    const saved = loadSavedCharacter();
    if (saved) return saved;
    const initial = createInitialCharacter('Valen', 'ranger');
    saveCharacter(initial);
    return initial;
  });
  const [currentRegionId, setCurrentRegionId] = useState<number>(1);
  const [activeModal, setActiveModal] = useState<
    'none' | 'map' | 'character' | 'inventory' | 'contracts' | 'codex' | 'creation'
  >('none');
  const [isMuted, setIsMuted] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Active Region data
  const currentRegion =
    ALL_REGIONS.find((r) => r.id === currentRegionId) || ALL_REGIONS[0];

  // Runtime references - initialized immediately so it is never null
  const worldRef = useRef<GameWorldState>(initGameWorld(currentRegion, char));
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    mouseWorldX: 0,
    mouseWorldY: 0,
    attackDown: false,
    dodgeTriggered: false,
    skillQTriggered: false,
    skillWTriggered: false,
    skillETriggered: false,
    skillRTriggered: false,
    hunterSenseTriggered: false,
    potionHealthTriggered: false,
    potionStaminaTriggered: false,
  });

  // Re-initialize game world when region changes
  useEffect(() => {
    worldRef.current = initGameWorld(currentRegion, char);
  }, [currentRegionId]);

  // Periodic Auto-Save
  useEffect(() => {
    const interval = setInterval(() => {
      saveCharacter(char);
    }, 25000);
    return () => clearInterval(interval);
  }, [char]);

  // Global hotkeys for RPG modals
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toLowerCase();
      if (key === 'm') {
        setActiveModal((prev) => (prev === 'map' ? 'none' : 'map'));
      } else if (key === 'c') {
        setActiveModal((prev) => (prev === 'character' ? 'none' : 'character'));
      } else if (key === 'i') {
        setActiveModal((prev) => (prev === 'inventory' ? 'none' : 'inventory'));
      } else if (key === 'j') {
        setActiveModal((prev) => (prev === 'contracts' ? 'none' : 'contracts'));
      } else if (key === 'k') {
        setActiveModal((prev) => (prev === 'codex' ? 'none' : 'codex'));
      } else if (key === 'escape') {
        setActiveModal('none');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleManualSave = useCallback(() => {
    saveCharacter(char);
    setSaveNotification('PROGRESS STORED TO SECTOR TELEMETRY');
    setTimeout(() => setSaveNotification(null), 2500);
  }, [char]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleCharacterCreated = (name: string, archetype: ArchetypeId) => {
    const newChar = createInitialCharacter(name, archetype);
    saveCharacter(newChar);
    setChar(newChar);
    worldRef.current = initGameWorld(currentRegion, newChar);
    setActiveModal('none');
    soundEngine.playLevelUp();
    soundEngine.startAmbientMusic();
  };

  const handleSelectRegion = (regionId: number) => {
    setCurrentRegionId(regionId);
    if (!char.discoveredRegions.includes(regionId)) {
      char.discoveredRegions.push(regionId);
    }
    if (!char.discoveredCamps.includes(regionId)) {
      char.discoveredCamps.push(regionId);
    }
    const updated = { ...char, currentRegionId: regionId };
    setChar(updated);
    saveCharacter(updated);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#05070a] text-cyan-400 font-mono select-none">
      {/* 60 FPS HTML5 Canvas Game World */}
      <GameCanvas
        char={char}
        region={currentRegion}
        worldRef={worldRef}
        inputRef={inputRef}
        onCharUpdate={(updated) => setChar({ ...updated })}
      />

      {/* Immersive UI Tactical HUD */}
      <TacticalHUD
        char={char}
        world={worldRef.current}
        region={currentRegion}
        onOpenMap={() => setActiveModal('map')}
        onOpenCharacter={() => setActiveModal('character')}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenContracts={() => setActiveModal('contracts')}
        onOpenCodex={() => setActiveModal('codex')}
        onSaveGame={handleManualSave}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerSkill={(key) => {
          if (key === 'Q') inputRef.current.skillQTriggered = true;
          if (key === 'W') inputRef.current.skillWTriggered = true;
          if (key === 'E') inputRef.current.skillETriggered = true;
          if (key === 'R') inputRef.current.skillRTriggered = true;
        }}
        onTriggerDodge={() => {
          inputRef.current.dodgeTriggered = true;
        }}
        onTriggerAttack={() => {
          inputRef.current.attackDown = true;
          setTimeout(() => {
            inputRef.current.attackDown = false;
          }, 100);
        }}
        onTriggerHunterSense={() => {
          inputRef.current.hunterSenseTriggered = true;
        }}
        onTriggerPotion={(type) => {
          if (type === 'health') inputRef.current.potionHealthTriggered = true;
          if (type === 'stamina') inputRef.current.potionStaminaTriggered = true;
        }}
      />

      {/* Save Toast Notification */}
      {saveNotification && (
        <div className="absolute top-20 right-8 z-50 px-4 py-2 bg-cyan-950/90 border border-cyan-400 text-xs font-bold text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse">
          ✓ {saveNotification}
        </div>
      )}

      {/* Modals with Immersive UI Styling */}
      {activeModal === 'creation' && (
        <CharacterCreationModal onCreate={handleCharacterCreated} />
      )}

      {activeModal === 'map' && (
        <WorldMapModal
          currentRegionId={currentRegionId}
          discoveredRegions={char.discoveredRegions}
          discoveredCamps={char.discoveredCamps}
          onSelectRegion={handleSelectRegion}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'character' && (
        <CharacterModal
          char={char}
          onUpdateChar={(updated) => setChar({ ...updated })}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          char={char}
          onUpdateChar={(updated) => setChar({ ...updated })}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'contracts' && (
        <GuildContractsModal
          char={char}
          onUpdateChar={(updated) => setChar({ ...updated })}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'codex' && (
        <CodexModal char={char} onClose={() => setActiveModal('none')} />
      )}
    </div>
  );
}
