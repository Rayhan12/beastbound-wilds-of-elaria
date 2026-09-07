import { BiomeId } from '../types';
import { GameWorldState } from './gameLoop';
import { BIOMES } from '../data/biomes';
import { RuntimeMonster } from './gameTypes';

export function renderGameWorld(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  canvasWidth: number,
  canvasHeight: number,
  biome: BiomeId,
  zoom: number = 1.0
): void {
  // Clear screen
  ctx.save();
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Camera transformation (centered on player with screen shake)
  const shakeX = (Math.random() - 0.5) * world.screenShake;
  const shakeY = (Math.random() - 0.5) * world.screenShake;

  const cameraX = canvasWidth / 2 - (world.playerX + shakeX) * zoom;
  const cameraY = canvasHeight / 2 - (world.playerY + shakeY) * zoom;

  ctx.translate(cameraX, cameraY);
  ctx.scale(zoom, zoom);

  const biomeMeta = BIOMES[biome] || BIOMES['greenwild'];

  // 1. Draw World Ground & Tactical Grid
  drawTerrain(ctx, world, biomeMeta);

  // 2. Draw Campsite (Safe Zone)
  drawCamp(ctx, world);

  // 3. Draw Beast Tracks & Scent Trails
  drawTracks(ctx, world);

  // 4. Draw Traps
  drawTraps(ctx, world);

  // 5. Draw Loot on Ground
  drawLoot(ctx, world);

  // 6. Draw Monsters & Bosses
  drawMonsters(ctx, world);

  // 7. Draw Companion (if present)
  if (world.companion) {
    drawCompanion(ctx, world.companion);
  }

  // 8. Draw Player Hunter
  drawPlayer(ctx, world);

  // 9. Draw Projectiles
  drawProjectiles(ctx, world);

  // 10. Draw Slash Arcs & VFX
  drawSlashArcs(ctx, world);

  // 11. Draw Particles
  drawParticles(ctx, world);

  // 12. Draw Floating Damage Numbers
  drawFloatingTexts(ctx, world);

  ctx.restore();

  // 13. Dynamic Day/Night Lighting & Warm Lantern Glow (Screen-space compositing)
  drawEnvironmentalLighting(ctx, world, canvasWidth, canvasHeight, zoom);
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  meta: typeof BIOMES[BiomeId]
) {
  // Ground base
  ctx.fillStyle = meta.groundColor;
  ctx.fillRect(0, 0, world.worldWidth, world.worldHeight);

  // Tactical grid lines inspired by Immersive UI
  ctx.strokeStyle = 'rgba(77, 242, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 80;
  for (let x = 0; x < world.worldWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.worldHeight);
    ctx.stroke();
  }
  for (let y = 0; y < world.worldHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.worldWidth, y);
    ctx.stroke();
  }

  // Tactical perimeter boundary with glowing cyan edges
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, world.worldWidth, world.worldHeight);

  // Corner markers
  const markerSize = 40;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  // Top left
  ctx.beginPath();
  ctx.moveTo(0, markerSize); ctx.lineTo(0, 0); ctx.lineTo(markerSize, 0);
  ctx.stroke();
  // Top right
  ctx.beginPath();
  ctx.moveTo(world.worldWidth - markerSize, 0); ctx.lineTo(world.worldWidth, 0); ctx.lineTo(world.worldWidth, markerSize);
  ctx.stroke();
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(0, world.worldHeight - markerSize); ctx.lineTo(0, world.worldHeight); ctx.lineTo(markerSize, world.worldHeight);
  ctx.stroke();
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(world.worldWidth - markerSize, world.worldHeight); ctx.lineTo(world.worldWidth, world.worldHeight); ctx.lineTo(world.worldWidth, world.worldHeight - markerSize);
  ctx.stroke();

  // Natural environment features (trees, rocks, ancient monoliths)
  // Seeded procedural terrain elements
  const count = 75;
  for (let i = 0; i < count; i++) {
    const ox = ((i * 1973) % (world.worldWidth - 200)) + 100;
    const oy = ((i * 3259) % (world.worldHeight - 200)) + 100;

    // Skip camp radius
    if (Math.hypot(ox - world.camp.x, oy - world.camp.y) < world.camp.radius + 80) continue;

    if (i % 3 === 0) {
      // Ancient stone monolith / ruin pillar
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(ox, oy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ancient glowing rune on pillar
      ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.fillRect(ox - 3, oy - 8, 6, 16);
    } else {
      // Wilderness tree foliage
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // tree shadow
      ctx.beginPath();
      ctx.ellipse(ox + 8, oy + 12, 24, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tree trunk & canopy
      ctx.fillStyle = meta.id === 'emberlands' ? '#451a03' : meta.id === 'frostfang' ? '#334155' : '#14532d';
      ctx.beginPath();
      ctx.arc(ox, oy, 22, 0, Math.PI * 2);
      ctx.fill();

      // Canopy highlight
      ctx.fillStyle = meta.id === 'emberlands' ? '#78350f' : meta.id === 'frostfang' ? '#64748b' : '#166534';
      ctx.beginPath();
      ctx.arc(ox - 4, oy - 4, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCamp(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  const { camp } = world;

  // Safe perimeter boundary
  ctx.save();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(camp.x, camp.y, camp.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Camp safe zone ground glow
  const grad = ctx.createRadialGradient(camp.x, camp.y, 10, camp.x, camp.y, camp.radius);
  grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
  grad.addColorStop(0.6, 'rgba(34, 211, 238, 0.08)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(camp.x, camp.y, camp.radius, 0, Math.PI * 2);
  ctx.fill();

  // Central Campfire
  const time = Date.now() * 0.005;
  const flameSize = 14 + Math.sin(time * 3) * 3;

  // Fire pit stones
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(camp.x, camp.y, 22, 0, Math.PI * 2);
  ctx.fill();

  // Animated Fire
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(camp.x, camp.y - 2, flameSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(camp.x, camp.y - 4, flameSize * 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(camp.x, camp.y - 5, flameSize * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Hunter's Forge & Anvil
  ctx.fillStyle = '#475569';
  ctx.fillRect(camp.x - 60, camp.y - 45, 24, 16);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(camp.x - 56, camp.y - 49, 16, 5);

  // Bounty Board / Guild Post
  ctx.fillStyle = '#78350f';
  ctx.fillRect(camp.x + 40, camp.y - 50, 6, 28);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(camp.x + 30, camp.y - 65, 26, 20);
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1;
  ctx.strokeRect(camp.x + 30, camp.y - 65, 26, 20);

  // Label: HUNTER'S CAMP [SAFE ZONE]
  ctx.font = '10px monospace';
  ctx.fillStyle = '#22d3ee';
  ctx.textAlign = 'center';
  ctx.fillText('HUNTER CAMP // SAFE SECTOR', camp.x, camp.y - camp.radius + 20);
  ctx.restore();
}

function drawTracks(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.tracks.forEach((track) => {
    if (!track.revealed && !world.hunterSenseActive) return;

    ctx.save();
    ctx.translate(track.x, track.y);

    const isHighlight = world.hunterSenseActive;
    const alpha = isHighlight ? 0.9 : 0.6;

    if (track.type === 'footprint') {
      ctx.rotate(track.directionAngle);
      ctx.fillStyle = isHighlight ? 'rgba(56, 189, 248, 0.8)' : 'rgba(148, 163, 184, 0.5)';
      // Beast paw print
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Toes
      [-4, 0, 4].forEach((tx) => {
        ctx.beginPath();
        ctx.arc(tx, -7, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (track.type === 'blood_trail') {
      ctx.fillStyle = isHighlight ? '#f43f5e' : 'rgba(159, 18, 57, 0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.arc(6, 4, 3, 0, Math.PI * 2);
      ctx.arc(-5, 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Claw mark or scent
      ctx.rotate(track.directionAngle);
      ctx.strokeStyle = isHighlight ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      [-4, 0, 4].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(-10, y);
        ctx.lineTo(10, y + 2);
        ctx.stroke();
      });
    }

    if (isHighlight) {
      // Pulsing scent aura
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      const pulse = (Date.now() % 1000) / 1000;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + pulse * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawTraps(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.traps.forEach((trap) => {
    ctx.save();
    ctx.translate(trap.x, trap.y);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, trap.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Spikes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (trap.radius - 8), Math.sin(angle) * (trap.radius - 8));
      ctx.lineTo(Math.cos(angle) * trap.radius, Math.sin(angle) * trap.radius);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawLoot(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.loot.forEach((l) => {
    ctx.save();
    ctx.translate(l.x, l.y);

    const color = l.item.rarity === 'legendary' ? '#f59e0b' :
                  l.item.rarity === 'epic' ? '#c084fc' :
                  l.item.rarity === 'rare' ? '#38bdf8' : '#22c55e';

    // Glowing pillar beacon
    const grad = ctx.createLinearGradient(0, 0, 0, -40);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(-3, -40, 6, 40);

    // Glowing bag base
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle pulse
    const pulse = (Date.now() % 800) / 800;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 10 + pulse * 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });
}

function drawMonsters(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.monsters.forEach((m) => {
    if (m.health <= 0) return;

    ctx.save();
    ctx.translate(m.x, m.y);

    // Draw Telegraph indicator if winding up attack
    if (m.telegraph) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.telegraph.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Filling progress pie
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, m.telegraph.radius * m.telegraph.progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Monster Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, m.def.size * 0.4, m.def.size * 1.1, m.def.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Elite or Boss Glowing Aura
    if (m.isBoss) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, m.def.size + 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (m.isElite) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.def.size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Monster Body Facing
    ctx.rotate(m.angle);

    // Main torso
    ctx.fillStyle = m.frozenTime > 0 ? '#38bdf8' : m.burningTime > 0 ? '#ea580c' : m.def.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, m.def.size, m.def.size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Secondary markings / spine ridges
    if (m.def.secondaryColor) {
      ctx.fillStyle = m.def.secondaryColor;
      ctx.beginPath();
      ctx.ellipse(-m.def.size * 0.2, 0, m.def.size * 0.5, m.def.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head and Snout / Fangs
    ctx.fillStyle = m.def.color;
    ctx.beginPath();
    ctx.arc(m.def.size * 0.8, 0, m.def.size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Predator Eyes
    ctx.fillStyle = m.isBoss ? '#f43f5e' : '#fbbf24';
    ctx.fillRect(m.def.size * 0.85, -m.def.size * 0.2, 3, 3);
    ctx.fillRect(m.def.size * 0.85, m.def.size * 0.1, 3, 3);

    ctx.restore();

    // Monster Overhead Health Bar
    const barWidth = m.isBoss ? 80 : 44;
    const barHeight = m.isBoss ? 7 : 4;
    const hpFrac = Math.max(0, m.health / m.maxHealth);

    ctx.fillStyle = 'rgba(5, 7, 10, 0.8)';
    ctx.fillRect(m.x - barWidth / 2 - 1, m.y - m.def.size - 14, barWidth + 2, barHeight + 2);
    ctx.strokeStyle = m.isBoss ? '#f43f5e' : '#0ea5e9';
    ctx.lineWidth = 1;
    ctx.strokeRect(m.x - barWidth / 2 - 1, m.y - m.def.size - 14, barWidth + 2, barHeight + 2);

    ctx.fillStyle = m.isBoss ? '#ef4444' : '#22c55e';
    ctx.fillRect(m.x - barWidth / 2, m.y - m.def.size - 13, barWidth * hpFrac, barHeight);

    // Overhead Name & Weakness
    ctx.font = '10px monospace';
    ctx.fillStyle = m.isBoss ? '#fda4af' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`${m.def.name} ${m.isElite ? '[ELITE]' : ''}`, m.x, m.y - m.def.size - 18);
  });
}

function drawCompanion(ctx: CanvasRenderingContext2D, companion: NonNullable<GameWorldState['companion']>) {
  ctx.save();
  ctx.translate(companion.x, companion.y);

  // Spectral wolf glow
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(10, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Name tag
  ctx.font = '9px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText(companion.name, 0, -18);
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  ctx.save();
  ctx.translate(world.playerX, world.playerY);

  // Hunter Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Perfect Dodge Guaranteed Crit Aura
  if (world.guaranteedNextCrit) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Rotate to face mouse cursor
  ctx.rotate(world.playerAngle);

  // Hunter Cloak (Outer layer)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-2, 0, 16, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();

  // Hunter Armor Torso (Steel Slate)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  // Armor Crest / Trim (Cyan glow)
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pauldrons (Shoulder guards)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(-2, -12, 6, 0, Math.PI * 2);
  ctx.arc(-2, 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Head / Cowl
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(4, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Visor / Optics
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;
  ctx.fillRect(8, -3, 3, 6);
  ctx.shadowBlur = 0;

  // Weapon in hand (Tempered blade / bow grip)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(8, 8, 18, 4);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(14, 8, 4, 4);

  ctx.restore();

  // Player Target Crosshair inspired by Immersive UI
  ctx.save();
  ctx.translate(world.playerX, world.playerY);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawProjectiles(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.projectiles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glowing core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawSlashArcs(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.slashArcs.forEach((arc) => {
    ctx.save();
    ctx.translate(arc.x, arc.y);
    ctx.rotate(arc.angle);

    const frac = arc.life / arc.maxLife;
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = 6 * (1 - frac);
    ctx.beginPath();
    ctx.arc(0, 0, arc.radius, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    ctx.restore();
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, world: GameWorldState) {
  world.floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.font = `bold ${ft.size}px monospace`;
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

let lightingCanvas: HTMLCanvasElement | null = null;
let lightingCtx: CanvasRenderingContext2D | null = null;

function drawEnvironmentalLighting(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
) {
  // Day/Night ambient darkness
  const hour = world.gameTimeHours;
  let darkness = 0;
  if (hour >= 20 || hour < 5) {
    darkness = 0.65; // Night darkness
  } else if (hour >= 18) {
    darkness = ((hour - 18) / 2) * 0.65; // Dusk
  } else if (hour < 7) {
    darkness = (1 - (hour - 5) / 2) * 0.65; // Dawn
  }

  if (darkness <= 0.04) return;

  // Initialize or resize reusable offscreen canvas
  if (!lightingCanvas) {
    lightingCanvas = document.createElement('canvas');
  }
  if (lightingCanvas.width !== canvasWidth || lightingCanvas.height !== canvasHeight) {
    lightingCanvas.width = canvasWidth;
    lightingCanvas.height = canvasHeight;
    lightingCtx = null;
  }
  if (!lightingCtx) {
    lightingCtx = lightingCanvas.getContext('2d');
  }
  if (!lightingCtx) return;

  const lCtx = lightingCtx;

  // Reset and fill offscreen buffer with dark night atmospheric overlay
  lCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  lCtx.globalCompositeOperation = 'source-over';
  lCtx.fillStyle = `rgba(5, 10, 24, ${darkness})`;
  lCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Carve out illumination holes on the OFFSCREEN canvas only (never affects the game canvas directly)
  lCtx.globalCompositeOperation = 'destination-out';

  // Screen coordinates of player
  const playerScreenX = canvasWidth / 2;
  const playerScreenY = canvasHeight / 2;

  // Player lantern light cutout (radius 220)
  const pLight = lCtx.createRadialGradient(playerScreenX, playerScreenY, 15, playerScreenX, playerScreenY, 220);
  pLight.addColorStop(0, 'rgba(0, 0, 0, 1)');
  pLight.addColorStop(0.65, 'rgba(0, 0, 0, 0.85)');
  pLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  lCtx.fillStyle = pLight;
  lCtx.beginPath();
  lCtx.arc(playerScreenX, playerScreenY, 220, 0, Math.PI * 2);
  lCtx.fill();

  // Campfire light cutout (if on screen)
  const campScreenX = (world.camp.x - world.playerX) * zoom + canvasWidth / 2;
  const campScreenY = (world.camp.y - world.playerY) * zoom + canvasHeight / 2;
  if (
    campScreenX >= -260 &&
    campScreenX <= canvasWidth + 260 &&
    campScreenY >= -260 &&
    campScreenY <= canvasHeight + 260
  ) {
    const cLight = lCtx.createRadialGradient(campScreenX, campScreenY, 20, campScreenX, campScreenY, 260);
    cLight.addColorStop(0, 'rgba(0, 0, 0, 1)');
    cLight.addColorStop(0.7, 'rgba(0, 0, 0, 0.88)');
    cLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    lCtx.fillStyle = cLight;
    lCtx.beginPath();
    lCtx.arc(campScreenX, campScreenY, 260, 0, Math.PI * 2);
    lCtx.fill();
  }

  // Draw the night overlay non-destructively over the rendered scene
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightingCanvas, 0, 0);

  // Add subtle warm lantern glow around the player
  ctx.globalCompositeOperation = 'screen';
  const warmGlow = ctx.createRadialGradient(playerScreenX, playerScreenY, 8, playerScreenX, playerScreenY, 190);
  warmGlow.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
  warmGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)');
  warmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = warmGlow;
  ctx.beginPath();
  ctx.arc(playerScreenX, playerScreenY, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
