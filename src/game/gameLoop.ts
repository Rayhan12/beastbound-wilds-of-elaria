import {
  ActiveProjectile,
  BeastTrack,
  FloatingText,
  HunterCharacter,
  Particle,
  RegionInfo,
} from '../types';
import {
  RuntimeCompanion,
  RuntimeLoot,
  RuntimeMonster,
  RuntimeSlashArc,
  RuntimeTrap,
  WorldCamp,
} from './gameTypes';
import { BIOMES } from '../data/biomes';
import { getMonsterForRegion } from '../data/monsters';
import { SKILL_DEFINITIONS } from '../data/skills';
import { soundEngine } from '../audio/soundEngine';
import { awardExperience, saveCharacter } from './gameState';

let activeCharUpdateCallback: ((updated: HunterCharacter) => void) | null = null;

export interface GameWorldState {
  playerX: number;
  playerY: number;
  playerVx: number;
  playerVy: number;
  playerAngle: number;
  isDodging: boolean;
  dodgeTimer: number;
  dodgeDuration: number;
  dodgeCooldown: number;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  hunterSenseActive: boolean;
  hunterSenseTimer: number;
  skillCooldowns: { Q: number; W: number; E: number; R: number };
  monsters: RuntimeMonster[];
  projectiles: ActiveProjectile[];
  traps: RuntimeTrap[];
  loot: RuntimeLoot[];
  tracks: BeastTrack[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  slashArcs: RuntimeSlashArc[];
  companion: RuntimeCompanion | null;
  camp: WorldCamp;
  worldWidth: number;
  worldHeight: number;
  gameTimeHours: number; // 0 - 24
  screenShake: number;
  perfectDodgeWindow: number;
  guaranteedNextCrit: boolean;
  bossEntity: RuntimeMonster | null;
  levelCompleted: boolean;
  totalMonsters: number;
}

export const createInitialWorld = initGameWorld;
export function initGameWorld(region: RegionInfo, char: HunterCharacter): GameWorldState {
  const worldWidth = 2400;
  const worldHeight = 2400;
  const camp: WorldCamp = {
    x: 400,
    y: 400,
    radius: 220,
    name: `${region.name} - Hunter's Camp`,
  };

  // Generate monsters across the wilderness
  const monsters: RuntimeMonster[] = [];
  const monsterCount = 10 + Math.floor(Math.random() * 4);

  for (let i = 0; i < monsterCount; i++) {
    const isBoss = i === 0 && (region.id % 10 === 0 || Math.random() < 0.3);
    const def = getMonsterForRegion(region.id, region.biome, isBoss);

    // Position outside safe camp
    let mx = Math.random() * (worldWidth - 400) + 200;
    let my = Math.random() * (worldHeight - 400) + 200;
    while (Math.hypot(mx - camp.x, my - camp.y) < camp.radius + 150) {
      mx = Math.random() * (worldWidth - 400) + 200;
      my = Math.random() * (worldHeight - 400) + 200;
    }

    monsters.push({
      id: `monster_${i}_${Date.now()}`,
      def,
      x: mx,
      y: my,
      vx: 0,
      vy: 0,
      health: def.health,
      maxHealth: def.health,
      attack: def.attack,
      defense: def.defense,
      speed: def.speed,
      angle: Math.random() * Math.PI * 2,
      state: 'patrol',
      stateTimer: Math.random() * 3 + 2,
      attackCooldown: Math.random() * 1.5,
      isBoss: !!def.isBoss,
      isElite: !!def.isElite,
      currentPhase: 1,
      stunnedTime: 0,
      burningTime: 0,
      frozenTime: 0,
      poisonTime: 0,
    });
  }

  // Generate tracking clues (footprints, claw marks, blood trails)
  const tracks: BeastTrack[] = [];
  const targetMonster = monsters.find((m) => m.isBoss) || monsters.find((m) => m.isElite) || monsters[0];
  if (targetMonster) {
    const trackCount = 6;
    for (let t = 0; t < trackCount; t++) {
      const frac = (t + 1) / (trackCount + 1);
      const tx = camp.x + (targetMonster.x - camp.x) * frac + (Math.random() - 0.5) * 180;
      const ty = camp.y + (targetMonster.y - camp.y) * frac + (Math.random() - 0.5) * 180;
      const types: BeastTrack['type'][] = ['footprint', 'claw_mark', 'blood_trail', 'carcass', 'beast_scent'];
      tracks.push({
        id: `track_${t}`,
        x: tx,
        y: ty,
        type: types[t % types.length],
        targetMonsterId: targetMonster.id,
        revealed: t === 0,
        directionAngle: Math.atan2(targetMonster.y - ty, targetMonster.x - tx),
      });
    }
  }

  // Spirit companion if Beastmaster
  let companion: RuntimeCompanion | null = null;
  if (char.archetype === 'beastmaster') {
    companion = {
      name: 'Spirit Wolf',
      x: camp.x - 30,
      y: camp.y + 30,
      health: 400,
      maxHealth: 400,
      attack: 28,
      targetMonsterId: null,
      attackCooldown: 1.0,
    };
  }

  return {
    playerX: camp.x,
    playerY: camp.y,
    playerVx: 0,
    playerVy: 0,
    playerAngle: 0,
    isDodging: false,
    dodgeTimer: 0,
    dodgeDuration: 0.35,
    dodgeCooldown: 0,
    isAttacking: false,
    attackTimer: 0,
    attackCooldown: 0,
    hunterSenseActive: false,
    hunterSenseTimer: 0,
    skillCooldowns: { Q: 0, W: 0, E: 0, R: 0 },
    monsters,
    projectiles: [],
    traps: [],
    loot: [],
    tracks,
    floatingTexts: [],
    particles: [],
    slashArcs: [],
    companion,
    camp,
    worldWidth,
    worldHeight,
    gameTimeHours: 10.5, // 10:30 AM daylight
    screenShake: 0,
    perfectDodgeWindow: 0,
    guaranteedNextCrit: false,
    bossEntity: monsters.find((m) => m.isBoss) || null,
    levelCompleted: false,
    totalMonsters: monsters.length,
  };
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  mouseWorldX: number;
  mouseWorldY: number;
  attackDown: boolean;
  dodgeTriggered: boolean;
  skillQTriggered: boolean;
  skillWTriggered: boolean;
  skillETriggered: boolean;
  skillRTriggered: boolean;
  hunterSenseTriggered: boolean;
  potionHealthTriggered: boolean;
  potionStaminaTriggered: boolean;
}

export function updateGameWorld(
  world: GameWorldState,
  input: InputState,
  char: HunterCharacter,
  onCharUpdate: (updated: HunterCharacter) => void,
  dt: number
): void {
  activeCharUpdateCallback = onCharUpdate;

  // Clamp delta time to avoid large physics steps
  const delta = Math.min(dt, 0.05);

  // Time of day progression (1 real second = 0.5 game minutes)
  world.gameTimeHours = (world.gameTimeHours + (delta * 0.04)) % 24;

  // Screen shake decay
  if (world.screenShake > 0) {
    world.screenShake = Math.max(0, world.screenShake - delta * 20);
  }

  // Hunter sense duration
  if (world.hunterSenseActive) {
    world.hunterSenseTimer -= delta;
    if (world.hunterSenseTimer <= 0) {
      world.hunterSenseActive = false;
    }
  }
  if (input.hunterSenseTriggered && !world.hunterSenseActive) {
    world.hunterSenseActive = true;
    world.hunterSenseTimer = 8.0;
    soundEngine.playTrackFound();
    world.floatingTexts.push({
      id: `fs_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 30,
      text: 'HUNTER SENSE ACTIVE',
      color: '#38bdf8',
      size: 16,
      lifetime: 1.5,
      vy: -25,
    });
  }

  // Cooldown updates
  if (world.dodgeCooldown > 0) world.dodgeCooldown = Math.max(0, world.dodgeCooldown - delta);
  if (world.attackCooldown > 0) world.attackCooldown = Math.max(0, world.attackCooldown - delta);
  if (world.perfectDodgeWindow > 0) world.perfectDodgeWindow = Math.max(0, world.perfectDodgeWindow - delta);

  (['Q', 'W', 'E', 'R'] as const).forEach((k) => {
    if (world.skillCooldowns[k] > 0) {
      world.skillCooldowns[k] = Math.max(0, world.skillCooldowns[k] - delta);
    }
  });

  // Passive Stamina Recovery when not sprinting/dodging
  if (char.stats.stamina < char.stats.maxStamina && !world.isDodging) {
    const stamRecovery = 25 * delta;
    char.stats.stamina = Math.min(char.stats.maxStamina, char.stats.stamina + stamRecovery);
  }

  // Player Facing Angle towards mouse cursor
  world.playerAngle = Math.atan2(input.mouseWorldY - world.playerY, input.mouseWorldX - world.playerX);

  // Dodge Roll Execution
  if (input.dodgeTriggered && !world.isDodging && world.dodgeCooldown <= 0 && char.stats.stamina >= 20) {
    char.stats.stamina -= 20;
    world.isDodging = true;
    world.dodgeTimer = world.dodgeDuration;
    world.dodgeCooldown = 0.65;
    soundEngine.playDodge();

    // Check if player dodged right before a monster attack (PERFECT DODGE)
    const nearbyAttackingMonster = world.monsters.find(
      (m) => Math.hypot(m.x - world.playerX, m.y - world.playerY) < 140 && m.state === 'windup'
    );
    if (nearbyAttackingMonster) {
      world.perfectDodgeWindow = 3.0;
      world.guaranteedNextCrit = true;
      world.screenShake = 6;
      world.floatingTexts.push({
        id: `pd_${Date.now()}`,
        x: world.playerX,
        y: world.playerY - 45,
        text: '★ PERFECT DODGE! NEXT HIT CRIT ★',
        color: '#fbbf24',
        size: 18,
        lifetime: 1.8,
        vy: -30,
      });
      // Spawn golden aura particles
      for (let p = 0; p < 12; p++) {
        world.particles.push({
          x: world.playerX,
          y: world.playerY,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
          size: 4,
          color: '#f59e0b',
          alpha: 1,
          life: 0,
          maxLife: 0.5,
          shape: 'spark',
        });
      }
    }
  }

  // Movement Physics
  let moveX = 0;
  let moveY = 0;
  if (input.up) moveY -= 1;
  if (input.down) moveY += 1;
  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;

  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.7071;
    moveY *= 0.7071;
  }

  if (world.isDodging) {
    world.dodgeTimer -= delta;
    const dodgeSpeed = char.stats.moveSpeed * 2.4;
    // Roll along movement direction or facing angle
    const rollAngle = moveX !== 0 || moveY !== 0 ? Math.atan2(moveY, moveX) : world.playerAngle;
    world.playerX += Math.cos(rollAngle) * dodgeSpeed * delta;
    world.playerY += Math.sin(rollAngle) * dodgeSpeed * delta;

    // Dodge trail particles
    if (Math.random() < 0.6) {
      world.particles.push({
        x: world.playerX,
        y: world.playerY,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 6,
        color: '#94a3b8',
        alpha: 0.6,
        life: 0,
        maxLife: 0.25,
      });
    }

    if (world.dodgeTimer <= 0) {
      world.isDodging = false;
    }
  } else {
    // Normal walking/running
    const speed = char.stats.moveSpeed * 1.35;
    world.playerX += moveX * speed * delta;
    world.playerY += moveY * speed * delta;
  }

  // Bounds clamp
  world.playerX = Math.max(40, Math.min(world.worldWidth - 40, world.playerX));
  world.playerY = Math.max(40, Math.min(world.worldHeight - 40, world.playerY));

  // Potions
  if (input.potionHealthTriggered && char.potions.health > 0 && char.stats.health < char.stats.maxHealth) {
    char.potions.health -= 1;
    char.stats.health = Math.min(char.stats.maxHealth, char.stats.health + 350);
    soundEngine.playPotion();
    world.floatingTexts.push({
      id: `heal_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 25,
      text: '+350 HP',
      color: '#22c55e',
      size: 16,
      lifetime: 1.2,
      vy: -20,
    });
  }
  if (input.potionStaminaTriggered && char.potions.stamina > 0 && char.stats.stamina < char.stats.maxStamina) {
    char.potions.stamina -= 1;
    char.stats.stamina = Math.min(char.stats.maxStamina, char.stats.stamina + 150);
    soundEngine.playPotion();
    world.floatingTexts.push({
      id: `stam_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 25,
      text: '+150 STAMINA',
      color: '#eab308',
      size: 16,
      lifetime: 1.2,
      vy: -20,
    });
  }

  // Normal Primary Attack
  if (input.attackDown && world.attackCooldown <= 0 && !world.isDodging) {
    const isRanged = char.archetype === 'ranger' || char.archetype === 'arcanist';
    world.attackCooldown = isRanged ? 0.45 : 0.35;
    world.isAttacking = true;
    world.attackTimer = 0.2;

    if (isRanged) {
      if (char.archetype === 'ranger') {
        soundEngine.playArrowShoot();
        const arrowSpeed = 550;
        world.projectiles.push({
          id: `proj_${Date.now()}`,
          x: world.playerX,
          y: world.playerY,
          vx: Math.cos(world.playerAngle) * arrowSpeed,
          vy: Math.sin(world.playerAngle) * arrowSpeed,
          radius: 5,
          color: '#fbbf24',
          damage: char.stats.attack,
          isPlayer: true,
          lifetime: 0.54, // Increased by 1.5x (~297px range)
          element: 'physical',
        });
      } else {
        // Arcanist magic bolt
        soundEngine.playSpellCast();
        const spellSpeed = 480;
        world.projectiles.push({
          id: `proj_${Date.now()}`,
          x: world.playerX,
          y: world.playerY,
          vx: Math.cos(world.playerAngle) * spellSpeed,
          vy: Math.sin(world.playerAngle) * spellSpeed,
          radius: 8,
          color: '#38bdf8',
          damage: Math.floor(char.stats.attack * 1.15),
          isPlayer: true,
          lifetime: 0.60, // Increased by 1.5x (~288px range)
          element: 'frost',
        });
      }
    } else {
      // Melee weapon swing
      soundEngine.playSwing();
      const slashRadius = 75;
      world.slashArcs.push({
        x: world.playerX,
        y: world.playerY,
        angle: world.playerAngle,
        radius: slashRadius,
        color: '#f8fafc',
        life: 0,
        maxLife: 0.18,
      });

      // Check hit on monsters within arc
      executeMeleeArc(world, char, slashRadius, Math.PI * 0.7, char.stats.attack, 'physical');
    }
  }

  // Skills Triggering (Q, W, E, R)
  (['Q', 'W', 'E', 'R'] as const).forEach((key) => {
    const trigger = key === 'Q' ? input.skillQTriggered :
                    key === 'W' ? input.skillWTriggered :
                    key === 'E' ? input.skillETriggered : input.skillRTriggered;

    if (trigger && world.skillCooldowns[key] <= 0) {
      const skillId = char.activeSkills[key];
      const skillDef = SKILL_DEFINITIONS[skillId];
      if (skillDef) {
        const skillLevel = char.skillLevels?.[skillId] || 1;
        const staminaCost = Math.max(5, Math.floor(skillDef.staminaCost * (1 - (skillLevel - 1) * 0.05)));
        const cooldown = Math.max(1, skillDef.cooldown * (1 - (skillLevel - 1) * 0.05));
        if (char.stats.stamina >= staminaCost) {
          char.stats.stamina -= staminaCost;
          world.skillCooldowns[key] = cooldown;
          executeSkill(world, char, skillDef, skillLevel);
        }
      }
    }
  });

  // Update Projectiles
  for (let i = world.projectiles.length - 1; i >= 0; i--) {
    const p = world.projectiles[i];
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.lifetime -= delta;

    // Particle spark behind projectile
    if (Math.random() < 0.4) {
      world.particles.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        size: 3,
        color: p.color,
        alpha: 0.8,
        life: 0,
        maxLife: 0.2,
      });
    }

    if (p.lifetime <= 0) {
      world.projectiles.splice(i, 1);
      continue;
    }

    // Collision with monsters or player
    if (p.isPlayer) {
      for (const m of world.monsters) {
        if (m.health <= 0) continue;
        const dist = Math.hypot(m.x - p.x, m.y - p.y);
        if (dist < m.def.size + p.radius) {
          applyDamageToMonster(world, char, m, p.damage, p.element, p.x, p.y);
          if (!p.piercing) {
            world.projectiles.splice(i, 1);
            break;
          }
        }
      }
    } else {
      // Enemy projectile hitting player
      if (!world.isDodging) {
        const dist = Math.hypot(world.playerX - p.x, world.playerY - p.y);
        if (dist < 22 + p.radius) {
          applyDamageToPlayer(world, char, p.damage);
          world.projectiles.splice(i, 1);
        }
      }
    }
  }

  // Update Traps
  for (let i = world.traps.length - 1; i >= 0; i--) {
    const tr = world.traps[i];
    tr.duration -= delta;
    if (tr.duration <= 0) {
      world.traps.splice(i, 1);
      continue;
    }
    // Check monster step
    for (const m of world.monsters) {
      if (m.health <= 0) continue;
      if (Math.hypot(m.x - tr.x, m.y - tr.y) < tr.radius + m.def.size) {
        applyDamageToMonster(world, char, m, tr.damage, tr.element, tr.x, tr.y);
        m.frozenTime = 2.0; // trap immobilizes
        tr.triggered = true;
        soundEngine.playHit(true);
        world.traps.splice(i, 1);
        break;
      }
    }
  }

  // Update Slash Arcs
  for (let i = world.slashArcs.length - 1; i >= 0; i--) {
    const arc = world.slashArcs[i];
    arc.life += delta;
    if (arc.life >= arc.maxLife) {
      world.slashArcs.splice(i, 1);
    }
  }

  // Update Monsters AI
  let anyInCombat = false;
  let bossInFight = false;

  for (const m of world.monsters) {
    if (m.health <= 0) continue;

    const distToPlayer = Math.hypot(world.playerX - m.x, world.playerY - m.y);
    const distToCamp = Math.hypot(m.x - world.camp.x, m.y - world.camp.y);

    // Repel monsters from safe campfire
    if (distToCamp < world.camp.radius) {
      const angleFromCamp = Math.atan2(m.y - world.camp.y, m.x - world.camp.x);
      m.x += Math.cos(angleFromCamp) * 120 * delta;
      m.y += Math.sin(angleFromCamp) * 120 * delta;
      m.state = 'patrol';
      continue;
    }

    // Status effect decays
    if (m.stunnedTime > 0) {
      m.stunnedTime -= delta;
      continue;
    }
    if (m.frozenTime > 0) {
      m.frozenTime -= delta;
      continue;
    }
    if (m.burningTime > 0) {
      m.burningTime -= delta;
      if (Math.random() < 0.25) {
        applyDamageToMonster(world, char, m, Math.floor(char.stats.attack * 0.15), 'fire', m.x, m.y, false);
      }
    }

    // Aggro detection range
    const aggroRange = m.isBoss ? 550 : m.isElite ? 420 : 320;
    if (distToPlayer < aggroRange && distToCamp >= world.camp.radius) {
      anyInCombat = true;
      if (m.isBoss) bossInFight = true;

      // Behavioral states
      m.attackCooldown -= delta;

      if (m.state === 'charging' && m.chargeTarget) {
        const cAngle = m.chargeAngle || 0;
        m.x += Math.cos(cAngle) * m.speed * 2.2 * delta;
        m.y += Math.sin(cAngle) * m.speed * 2.2 * delta;
        m.stateTimer -= delta;

        // Check if charge hits player
        if (!world.isDodging && Math.hypot(world.playerX - m.x, world.playerY - m.y) < m.def.size + 18) {
          applyDamageToPlayer(world, char, Math.floor(m.attack * 1.3));
          world.screenShake = 12;
          m.state = 'chase';
          m.attackCooldown = 2.0;
        }

        if (m.stateTimer <= 0) {
          m.state = 'chase';
          m.attackCooldown = 1.8;
        }
      } else if (m.state === 'windup') {
        m.stateTimer -= delta;
        if (m.telegraph) {
          m.telegraph.progress = Math.min(1, 1 - m.stateTimer / 0.7);
        }
        if (m.stateTimer <= 0) {
          // Unleash telegraphed attack
          m.telegraph = undefined;
          if (m.def.behaviors.includes('charge')) {
            m.state = 'charging';
            m.stateTimer = 0.8;
            m.chargeAngle = Math.atan2(world.playerY - m.y, world.playerX - m.x);
            m.chargeTarget = { x: world.playerX, y: world.playerY };
            soundEngine.playBossRoar();
          } else {
            // Melee bite / swipe
            if (!world.isDodging && distToPlayer < m.def.size + 35) {
              applyDamageToPlayer(world, char, m.attack);
            }
            m.state = 'chase';
            m.attackCooldown = 1.4;
          }
        }
      } else {
        // Chase or flank
        m.angle = Math.atan2(world.playerY - m.y, world.playerX - m.x);

        if (m.def.behaviors.includes('flank') && distToPlayer < 240 && distToPlayer > 80) {
          // Circle around player
          const circleAngle = m.angle + Math.PI / 2;
          m.x += (Math.cos(m.angle) * 0.4 + Math.cos(circleAngle) * 0.8) * m.speed * delta;
          m.y += (Math.sin(m.angle) * 0.4 + Math.sin(circleAngle) * 0.8) * m.speed * delta;
        } else {
          // Direct advance
          m.x += Math.cos(m.angle) * m.speed * delta;
          m.y += Math.sin(m.angle) * m.speed * delta;
        }

        // Ranged spit attack (spiders/cultists/bosses)
        if (m.def.behaviors.includes('ranged_spit') && m.attackCooldown <= 0 && distToPlayer < 350) {
          m.attackCooldown = 2.5;
          soundEngine.playSpellCast();
          const spitSpeed = 360;
          world.projectiles.push({
            id: `spit_${Date.now()}`,
            x: m.x,
            y: m.y,
            vx: Math.cos(m.angle) * spitSpeed,
            vy: Math.sin(m.angle) * spitSpeed,
            radius: 7,
            color: m.def.element === 'fire' ? '#ea580c' : '#84cc16',
            damage: Math.floor(m.attack * 0.9),
            isPlayer: false,
            lifetime: 1.8,
            element: m.def.element,
          });
        }

        // Prepare heavy attack if in range
        if (m.attackCooldown <= 0 && distToPlayer < m.def.size + 45) {
          m.state = 'windup';
          m.stateTimer = 0.65;
          m.telegraph = {
            type: 'circle',
            x: m.x,
            y: m.y,
            radius: m.def.size + 35,
            progress: 0,
          };
        }
      }
    } else {
      // Idle patrol
      m.stateTimer -= delta;
      if (m.stateTimer <= 0) {
        m.stateTimer = Math.random() * 3 + 2;
        m.angle = Math.random() * Math.PI * 2;
      }
      m.x += Math.cos(m.angle) * (m.speed * 0.25) * delta;
      m.y += Math.sin(m.angle) * (m.speed * 0.25) * delta;
    }

    // Keep monster within world boundaries
    m.x = Math.max(50, Math.min(world.worldWidth - 50, m.x));
    m.y = Math.max(50, Math.min(world.worldHeight - 50, m.y));
  }

  soundEngine.setCombatState(anyInCombat, bossInFight);

  // Companion Wolf AI (if Beastmaster)
  if (world.companion) {
    const comp = world.companion;
    const distToHunter = Math.hypot(world.playerX - comp.x, world.playerY - comp.y);

    // Target nearest hostile monster
    let closestMonster: RuntimeMonster | null = null;
    let closestDist = 260;
    for (const m of world.monsters) {
      if (m.health <= 0) continue;
      const d = Math.hypot(m.x - comp.x, m.y - comp.y);
      if (d < closestDist) {
        closestDist = d;
        closestMonster = m;
      }
    }

    if (closestMonster) {
      // Move toward monster and bite
      const mAngle = Math.atan2(closestMonster.y - comp.y, closestMonster.x - comp.x);
      comp.x += Math.cos(mAngle) * 160 * delta;
      comp.y += Math.sin(mAngle) * 160 * delta;

      comp.attackCooldown -= delta;
      if (comp.attackCooldown <= 0 && closestDist < closestMonster.def.size + 25) {
        comp.attackCooldown = 1.0;
        soundEngine.playHit(false);
        applyDamageToMonster(world, char, closestMonster, comp.attack, 'physical', comp.x, comp.y);
      }
    } else {
      // Follow hunter
      if (distToHunter > 60) {
        const followAngle = Math.atan2(world.playerY - comp.y, world.playerX - comp.x);
        comp.x += Math.cos(followAngle) * 150 * delta;
        comp.y += Math.sin(followAngle) * 150 * delta;
      }
    }
  }

  // Tracking clue interaction (walk near clue to reveal)
  for (const track of world.tracks) {
    if (!track.revealed) {
      const dist = Math.hypot(world.playerX - track.x, world.playerY - track.y);
      if (dist < 90 || (world.hunterSenseActive && dist < 320)) {
        track.revealed = true;
        soundEngine.playTrackFound();
        world.floatingTexts.push({
          id: `track_${Date.now()}`,
          x: track.x,
          y: track.y - 20,
          text: `TRACK FOUND: ${track.type.replace('_', ' ').toUpperCase()}`,
          color: '#38bdf8',
          size: 15,
          lifetime: 1.6,
          vy: -22,
        });
      }
    }
  }

  // Collect Loot on ground
  for (let i = world.loot.length - 1; i >= 0; i--) {
    const l = world.loot[i];
    const dist = Math.hypot(world.playerX - l.x, world.playerY - l.y);
    if (dist < 45) {
      // Add to inventory
      soundEngine.playHarvest();
      const existing = char.inventory.find((it) => it.id === l.item.id);
      if (existing && l.item.stackCount) {
        existing.stackCount = (existing.stackCount || 1) + (l.item.stackCount || 1);
      } else {
        char.inventory.push({ ...l.item, stackCount: l.item.stackCount || 1 });
      }

      world.floatingTexts.push({
        id: `loot_${Date.now()}`,
        x: l.x,
        y: l.y - 30,
        text: `+${l.item.name}`,
        color: l.item.rarity === 'legendary' ? '#f59e0b' : l.item.rarity === 'epic' ? '#a855f7' : '#38bdf8',
        size: 16,
        lifetime: 1.4,
        vy: -25,
      });

      world.loot.splice(i, 1);
      saveCharacter(char);
      onCharUpdate({ ...char });
    }
  }

  // Update Floating Texts
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * delta;
    ft.lifetime -= delta;
    if (ft.lifetime <= 0) {
      world.floatingTexts.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.life += delta;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    if (p.life >= p.maxLife) {
      world.particles.splice(i, 1);
    }
  }
}

function executeMeleeArc(
  world: GameWorldState,
  char: HunterCharacter,
  radius: number,
  arcSpread: number,
  damage: number,
  element: import('../types').ElementType
) {
  world.monsters.forEach((m) => {
    if (m.health <= 0) return;
    const dist = Math.hypot(m.x - world.playerX, m.y - world.playerY);
    if (dist <= radius + m.def.size) {
      const angleToMonster = Math.atan2(m.y - world.playerY, m.x - world.playerX);
      let angleDiff = Math.abs(world.playerAngle - angleToMonster);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

      if (angleDiff <= arcSpread / 2) {
        applyDamageToMonster(world, char, m, damage, element, m.x, m.y);
      }
    }
  });
}

function executeSkill(
  world: GameWorldState,
  char: HunterCharacter,
  skill: import('../types').SkillDefinition,
  skillLevel = 1
) {
  soundEngine.playSpellCast();
  const potency = 1 + (skillLevel - 1) * 0.20;

  if (skill.id === 'vanguard_cleave') {
    soundEngine.playSwing();
    world.slashArcs.push({
      x: world.playerX,
      y: world.playerY,
      angle: world.playerAngle,
      radius: 110 + (skillLevel - 1) * 6,
      color: '#fbbf24',
      life: 0,
      maxLife: 0.22,
    });
    executeMeleeArc(world, char, 110 + (skillLevel - 1) * 6, Math.PI, Math.floor(char.stats.attack * 1.6 * potency), 'physical');
  } else if (skill.id === 'vanguard_shield_bash') {
    world.screenShake = 8;
    executeMeleeArc(world, char, 85, Math.PI * 0.6, Math.floor(char.stats.attack * 1.2 * potency), 'physical');
    world.monsters.forEach((m) => {
      if (Math.hypot(m.x - world.playerX, m.y - world.playerY) < 95) {
        m.stunnedTime = 2.0;
      }
    });
  } else if (skill.id === 'vanguard_earthshaker') {
    world.screenShake = 18;
    soundEngine.playBossRoar();
    world.slashArcs.push({
      x: world.playerX,
      y: world.playerY,
      angle: 0,
      radius: 170 + (skillLevel - 1) * 10,
      color: '#f97316',
      life: 0,
      maxLife: 0.35,
    });
    world.monsters.forEach((m) => {
      if (Math.hypot(m.x - world.playerX, m.y - world.playerY) < 170 + (skillLevel - 1) * 10) {
        applyDamageToMonster(world, char, m, Math.floor(char.stats.attack * 3.5 * potency), 'physical', m.x, m.y);
        m.stunnedTime = 1.5;
      }
    });
  } else if (skill.id === 'ranger_piercing') {
    soundEngine.playArrowShoot();
    world.projectiles.push({
      id: `pierce_${Date.now()}`,
      x: world.playerX,
      y: world.playerY,
      vx: Math.cos(world.playerAngle) * 800,
      vy: Math.sin(world.playerAngle) * 800,
      radius: 6,
      color: '#22d3ee',
      damage: Math.floor(char.stats.attack * 1.75 * potency),
      isPlayer: true,
      lifetime: 1.8,
      element: 'physical',
      piercing: true,
    });
  } else if (skill.id === 'ranger_trap') {
    world.traps.push({
      id: `trap_${Date.now()}`,
      x: world.playerX + Math.cos(world.playerAngle) * 40,
      y: world.playerY + Math.sin(world.playerAngle) * 40,
      radius: 35 + (skillLevel - 1) * 4,
      damage: Math.floor(char.stats.attack * 1.8 * potency),
      duration: 30.0,
      element: 'poison',
      triggered: false,
    });
  } else if (skill.id === 'arcanist_fireball') {
    world.projectiles.push({
      id: `fball_${Date.now()}`,
      x: world.playerX,
      y: world.playerY,
      vx: Math.cos(world.playerAngle) * 550,
      vy: Math.sin(world.playerAngle) * 550,
      radius: 12 + (skillLevel - 1) * 2,
      color: '#ea580c',
      damage: Math.floor(char.stats.attack * 1.9 * potency),
      isPlayer: true,
      lifetime: 1.5,
      element: 'fire',
    });
  } else if (skill.id === 'arcanist_frostnova') {
    world.slashArcs.push({
      x: world.playerX,
      y: world.playerY,
      angle: 0,
      radius: 140 + (skillLevel - 1) * 8,
      color: '#38bdf8',
      life: 0,
      maxLife: 0.3,
    });
    world.monsters.forEach((m) => {
      if (Math.hypot(m.x - world.playerX, m.y - world.playerY) < 140 + (skillLevel - 1) * 8) {
        applyDamageToMonster(world, char, m, Math.floor(char.stats.attack * 1.1 * potency), 'frost', m.x, m.y);
        m.frozenTime = 2.2;
      }
    });
  } else if (skill.id === 'reaper_shadow_strike') {
    // Blink behind nearest beast
    let closestM: RuntimeMonster | null = null;
    let closestD = 350;
    world.monsters.forEach((m) => {
      const d = Math.hypot(m.x - world.playerX, m.y - world.playerY);
      if (d < closestD && m.health > 0) {
        closestD = d;
        closestM = m;
      }
    });
    if (closestM) {
      world.playerX = (closestM as RuntimeMonster).x - Math.cos((closestM as RuntimeMonster).angle) * 35;
      world.playerY = (closestM as RuntimeMonster).y - Math.sin((closestM as RuntimeMonster).angle) * 35;
      world.guaranteedNextCrit = true;
      applyDamageToMonster(world, char, closestM, Math.floor(char.stats.attack * 2.2 * potency), 'poison', world.playerX, world.playerY);
      soundEngine.playHit(true);
    }
  } else if (skill.id === 'beast_pack_call') {
    // Summon or refresh companion
    world.companion = {
      name: 'Spectral Alpha Wolf',
      x: world.playerX - 25,
      y: world.playerY + 25,
      health: 550 + (skillLevel - 1) * 120,
      maxHealth: 550 + (skillLevel - 1) * 120,
      attack: Math.floor(char.stats.attack * 0.8 * potency),
      targetMonsterId: null,
      attackCooldown: 0.8,
    };
    soundEngine.playBossRoar();
  }
}

export function applyDamageToMonster(
  world: GameWorldState,
  char: HunterCharacter,
  m: RuntimeMonster,
  rawDamage: number,
  element: import('../types').ElementType,
  hitX: number,
  hitY: number,
  isDirectHit = true
) {
  // Elemental calculation
  let multiplier = 1.0;
  if (m.def.weakness === element) {
    multiplier = 1.5; // Exploit weakness!
  } else if (m.def.resistance === element) {
    multiplier = 0.6; // Resisted
  }

  // Armor reduction
  const effectiveArmor = Math.max(0, m.defense - 5);
  let damage = Math.max(1, Math.floor((rawDamage * multiplier) - (effectiveArmor * 0.4)));

  // Critical strike check
  const isCrit = world.guaranteedNextCrit || Math.random() * 100 < char.stats.critChance;
  if (isCrit) {
    damage = Math.floor(damage * char.stats.critDamage);
    world.guaranteedNextCrit = false;
  }

  m.health -= damage;
  if (isDirectHit) {
    soundEngine.playHit(isCrit);
    soundEngine.playMonsterHurt();
    world.screenShake = isCrit ? 10 : 4;
  }

  // Status effects
  if (element === 'fire') m.burningTime = 3.0;
  if (element === 'frost') m.frozenTime = 1.5;

  // Floating damage number
  const color = isCrit ? '#fbbf24' : element === 'fire' ? '#ea580c' : element === 'frost' ? '#38bdf8' : '#ffffff';
  world.floatingTexts.push({
    id: `dmg_${Date.now()}_${Math.random()}`,
    x: hitX + (Math.random() - 0.5) * 20,
    y: hitY - 20,
    text: `${damage}${isCrit ? '!' : ''}`,
    color,
    size: isCrit ? 20 : 15,
    lifetime: 0.9,
    vy: -35,
  });

  // Hit sparks
  for (let i = 0; i < (isCrit ? 8 : 4); i++) {
    world.particles.push({
      x: hitX,
      y: hitY,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.5) * 120,
      size: 3,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.3,
    });
  }

  // Boss Phase Transition Trigger
  if (m.isBoss && m.def.phases && m.def.phases > 1) {
    const healthFrac = m.health / m.maxHealth;
    if (healthFrac <= 0.5 && m.currentPhase === 1) {
      m.currentPhase = 2;
      m.speed += 25;
      m.attack = Math.floor(m.attack * 1.25);
      world.screenShake = 16;
      soundEngine.playBossRoar();
      world.floatingTexts.push({
        id: `phase_${Date.now()}`,
        x: m.x,
        y: m.y - 50,
        text: '★ PHASE 2: PACK ROAR & ENRAGED ★',
        color: '#ef4444',
        size: 19,
        lifetime: 2.0,
        vy: -25,
      });
    }
  }

  // Monster Defeated
  if (m.health <= 0) {
    handleMonsterDeath(world, char, m);
  }
}

function handleMonsterDeath(world: GameWorldState, char: HunterCharacter, m: RuntimeMonster) {
  // Reward XP & Gold
  char.gold += m.def.goldReward;
  const xpReward = m.def.xpReward;

  // Award EXP and trigger Level Up math
  const { updated, leveledUp } = awardExperience(char, xpReward);
  Object.assign(char, updated);

  world.floatingTexts.push({
    id: `xp_${Date.now()}_${Math.random()}`,
    x: m.x,
    y: m.y - 40,
    text: `+${xpReward} XP  +${m.def.goldReward} Gold`,
    color: '#a855f7',
    size: 17,
    lifetime: 1.6,
    vy: -30,
  });

  if (leveledUp) {
    soundEngine.playLevelUp();
    world.screenShake = 14;
    world.floatingTexts.push({
      id: `lvl_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 55,
      text: `★ LEVEL UP! LVL ${char.level} ★`,
      color: '#fbbf24',
      size: 22,
      lifetime: 2.8,
      vy: -22,
    });
    world.floatingTexts.push({
      id: `pts_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 30,
      text: `+1 SKILL PT  +3 ATTR PTS`,
      color: '#22d3ee',
      size: 16,
      lifetime: 2.4,
      vy: -18,
    });

    // Level-up celebration spark burst
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 70 + Math.random() * 80;
      world.particles.push({
        x: world.playerX,
        y: world.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3.5,
        color: i % 2 === 0 ? '#fbbf24' : '#22d3ee',
        alpha: 1,
        life: 0,
        maxLife: 0.7,
        shape: 'spark',
      });
    }
  }

  // Drop loot items
  m.def.drops.forEach((drop) => {
    if (Math.random() <= drop.chance) {
      const count = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
      world.loot.push({
        id: `loot_${Date.now()}_${Math.random()}`,
        x: m.x + (Math.random() - 0.5) * 35,
        y: m.y + (Math.random() - 0.5) * 35,
        item: { ...drop.item, stackCount: count },
        sparkleTimer: 0,
      });
    }
  });

  // Update Hunter's Codex
  if (char.codex[m.def.id]) {
    char.codex[m.def.id].killCount += 1;
    char.codex[m.def.id].discovered = true;
  }

  // Update Hunt Contracts
  char.contracts.forEach((con) => {
    if (!con.completed && con.targetMonsterName.toLowerCase() === m.def.name.toLowerCase()) {
      con.currentCount += 1;
      if (con.currentCount >= con.targetCount) {
        con.completed = true;
        soundEngine.playQuestComplete();
        world.floatingTexts.push({
          id: `quest_${Date.now()}`,
          x: world.playerX,
          y: world.playerY - 50,
          text: `CONTRACT COMPLETED: ${con.title}!`,
          color: '#22c55e',
          size: 18,
          lifetime: 2.2,
          vy: -20,
        });
      }
    }
  });

  // Boss Defeat Victory
  if (m.isBoss) {
    if (!char.defeatedBosses.includes(m.def.name)) {
      char.defeatedBosses.push(m.def.name);
      char.trophies.push(`${m.def.name} Trophy`);
    }
    soundEngine.playLevelUp();
    world.screenShake = 20;
    world.floatingTexts.push({
      id: `boss_vic_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 70,
      text: `👑 REGIONAL BOSS DEFEATED: ${m.def.name.toUpperCase()}!`,
      color: '#f59e0b',
      size: 22,
      lifetime: 3.0,
      vy: -20,
    });
  }

  // Check if Level is Cleared (all monsters in this region dead or regional boss defeated)
  const remainingBeasts = world.monsters.filter((mon) => mon.id !== m.id && mon.health > 0).length;
  if (remainingBeasts === 0 || m.isBoss) {
    world.levelCompleted = true;
    soundEngine.playQuestComplete();
    world.floatingTexts.push({
      id: `clear_${Date.now()}`,
      x: world.playerX,
      y: world.playerY - 80,
      text: '★ LEVEL COMPLETED! READY FOR NEXT LEVEL ★',
      color: '#22c55e',
      size: 22,
      lifetime: 3.5,
      vy: -15,
    });
  }

  // Save character state to localStorage
  saveCharacter(char);

  // Notify UI
  if (activeCharUpdateCallback) {
    activeCharUpdateCallback({ ...char });
  }
}

function applyDamageToPlayer(world: GameWorldState, char: HunterCharacter, rawDamage: number) {
  if (world.isDodging) return; // Invulnerable while dodging

  const effectiveArmor = char.stats.defense;
  const damage = Math.max(1, Math.floor(rawDamage - (effectiveArmor * 0.35)));

  char.stats.health = Math.max(0, char.stats.health - damage);
  soundEngine.playHit(false);
  world.screenShake = 8;

  world.floatingTexts.push({
    id: `phurt_${Date.now()}`,
    x: world.playerX + (Math.random() - 0.5) * 20,
    y: world.playerY - 25,
    text: `-${damage}`,
    color: '#ef4444',
    size: 18,
    lifetime: 1.0,
    vy: -25,
  });

  // Death Handling: Respawn at camp without destroying character progress
  if (char.stats.health <= 0) {
    world.playerX = world.camp.x;
    world.playerY = world.camp.y;
    char.stats.health = Math.floor(char.stats.maxHealth * 0.7);
    char.stats.stamina = char.stats.maxStamina;
    soundEngine.playMonsterHurt();
    world.floatingTexts.push({
      id: `respawn_${Date.now()}`,
      x: world.camp.x,
      y: world.camp.y - 40,
      text: 'REVIVED AT HUNTER CAMP',
      color: '#38bdf8',
      size: 19,
      lifetime: 2.5,
      vy: -15,
    });
  }
}
