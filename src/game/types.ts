export type PowerLevel = 1 | 2 | 3;

export type BossId = "slime_king" | "magma_ogre" | "cyber_dragon";

export type BossConfig = {
  id: BossId;
  displayName: string;
  hp: number;
  theme: string;
  preferredPowerLevel: PowerLevel;
  color: number;
  accent: number;
  projectileTexture: string;
  fireRateMs: number;
  projectileSpeed: number;
  patterns: string[];
  shieldAt?: number;
};

export type PlayerStats = {
  maxHp: number;
  hp: number;
  moveSpeed: number;
  dashSpeed: number;
  dashDurationMs: number;
  dashCooldownMs: number;
};

export type BattleResult = {
  bossId: BossId;
  won: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  damageDealt: number;
  damageTaken: number;
  remainingHp: number;
  accuracy: number;
  stars: 0 | 1 | 2 | 3;
};
