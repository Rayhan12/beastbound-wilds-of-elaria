import React, { useEffect, useRef } from 'react';
import { HunterCharacter, RegionInfo } from '../types';
import { GameWorldState, InputState, updateGameWorld } from '../game/gameLoop';
import { renderGameWorld } from '../game/gameRenderer';

interface GameCanvasProps {
  char: HunterCharacter;
  region: RegionInfo;
  worldRef: React.MutableRefObject<GameWorldState | null>;
  inputRef: React.MutableRefObject<InputState>;
  onCharUpdate: (updated: HunterCharacter) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  char,
  region,
  worldRef,
  inputRef,
  onCharUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.parentElement?.clientWidth || window.innerWidth || 1280;
      const h = canvas.parentElement?.clientHeight || window.innerHeight || 720;
      canvas.width = Math.max(w, 320);
      canvas.height = Math.max(h, 240);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const world = worldRef.current;
      if (!world || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      // Convert canvas coordinate to world coordinates
      const zoom = 1.0;
      const cameraX = canvas.width / 2 - world.playerX * zoom;
      const cameraY = canvas.height / 2 - world.playerY * zoom;

      inputRef.current.mouseWorldX = (mouseCanvasX - cameraX) / zoom;
      inputRef.current.mouseWorldY = (mouseCanvasY - cameraY) / zoom;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        inputRef.current.attackDown = true;
      } else if (e.button === 2) {
        // Right click to dodge
        inputRef.current.dodgeTriggered = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        inputRef.current.attackDown = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputRef.current.up = true;
      if (key === 's' || key === 'arrowdown') inputRef.current.down = true;
      if (key === 'a' || key === 'arrowleft') inputRef.current.left = true;
      if (key === 'd' || key === 'arrowright') inputRef.current.right = true;
      if (key === ' ' || key === 'shift') inputRef.current.dodgeTriggered = true;
      if (key === 'q') inputRef.current.skillQTriggered = true;
      if (key === 'e') inputRef.current.skillETriggered = true;
      if (key === 'r') inputRef.current.skillRTriggered = true;
      if (key === 't') inputRef.current.hunterSenseTriggered = true;
      if (key === '1') inputRef.current.potionHealthTriggered = true;
      if (key === '2') inputRef.current.potionStaminaTriggered = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputRef.current.up = false;
      if (key === 's' || key === 'arrowdown') inputRef.current.down = false;
      if (key === 'a' || key === 'arrowleft') inputRef.current.left = false;
      if (key === 'd' || key === 'arrowright') inputRef.current.right = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main 60 FPS Game Loop
    const ctx = canvas.getContext('2d');
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const world = worldRef.current;
      if (world && ctx) {
        // Run physics and AI updates
        updateGameWorld(world, inputRef.current, char, onCharUpdate, dt);

        // Reset one-shot trigger inputs
        inputRef.current.dodgeTriggered = false;
        inputRef.current.skillQTriggered = false;
        inputRef.current.skillWTriggered = false;
        inputRef.current.skillETriggered = false;
        inputRef.current.skillRTriggered = false;
        inputRef.current.hunterSenseTriggered = false;
        inputRef.current.potionHealthTriggered = false;
        inputRef.current.potionStaminaTriggered = false;

        // Render world
        renderGameWorld(ctx, world, canvas.width, canvas.height, region.biome, 1.0);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [char, region, onCharUpdate, inputRef, worldRef]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-crosshair" />;
};
