import { ElementType, Item, MonsterVariant } from '../types';

export interface RuntimeMonster {
  id: string;
  def: MonsterVariant;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  angle: number;
  state: 'idle' | 'patrol' | 'chase' | 'flank' | 'charging' | 'windup' | 'stunned';
  stateTimer: number;
  attackCooldown: number;
  chargeTarget?: { x: number; y: number };
  chargeAngle?: number;
  isBoss: boolean;
  isElite: boolean;
  currentPhase: number;
  stunnedTime: number;
  burningTime: number;
  frozenTime: number;
  poisonTime: number;
  telegraph?: {
    type: 'circle' | 'cone' | 'line';
    x: number;
    y: number;
    radius: number;
    angle?: number;
    progress: number; // 0 to 1
  };
}

export interface RuntimeLoot {
  id: string;
  x: number;
  y: number;
  item: Item;
  sparkleTimer: number;
}

export interface RuntimeTrap {
  id: string;
  x: number;
  y: number;
  radius: number;
  damage: number;
  duration: number;
  element: ElementType;
  triggered: boolean;
}

export interface RuntimeCompanion {
  name: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  attack: number;
  targetMonsterId: string | null;
  attackCooldown: number;
}

export interface RuntimeSlashArc {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface WorldCamp {
  x: number;
  y: number;
  radius: number;
  name: string;
}
