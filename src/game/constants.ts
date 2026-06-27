import type { BossConfig, PlayerStats, PowerLevel } from "./types";

export const SCENE_KEYS = {
  boot: "BootScene",
  menu: "MenuScene",
  bossSelect: "BossSelectScene",
  battle: "BattleScene",
  result: "ResultScene"
} as const;

export const PLAYER_STATS: PlayerStats = {
  maxHp: 100,
  hp: 100,
  moveSpeed: 220,
  dashSpeed: 460,
  dashDurationMs: 180,
  dashCooldownMs: 900
};

export const POWER_DAMAGE: Record<PowerLevel, number> = {
  1: 12,
  2: 24,
  3: 42
};

export const POWER_COOLDOWN_MS: Record<PowerLevel, number> = {
  1: 500,
  2: 850,
  3: 1300
};

export const BOSSES: BossConfig[] = [
  {
    id: "slime_king",
    displayName: "Slime King",
    hp: 120,
    theme: "green neon slime",
    preferredPowerLevel: 1,
    color: 0x46f27d,
    accent: 0xf8d648,
    projectileTexture: "slime-shot",
    patterns: ["single_slime_shot", "triple_slime_spread", "slime_wave"]
  },
  {
    id: "magma_ogre",
    displayName: "Magma Ogre",
    hp: 170,
    theme: "orange magma",
    preferredPowerLevel: 2,
    color: 0xff7a2f,
    accent: 0xffd166,
    projectileTexture: "magma-shot",
    patterns: ["magma_drop", "double_fireball", "floor_burst"]
  },
  {
    id: "cyber_dragon",
    displayName: "Cyber Dragon",
    hp: 230,
    theme: "blue cyber neon",
    preferredPowerLevel: 3,
    color: 0x48d6ff,
    accent: 0xf854ff,
    projectileTexture: "cyber-shot",
    patterns: ["laser_pearl", "zigzag_bytes", "shield_phase"],
    shieldAt: 0.5
  }
];

export const COLORS = {
  ink: 0x101033,
  panel: 0x21184f,
  panelDark: 0x100b2e,
  text: "#ffffff",
  muted: "#b7b5ff",
  cyan: 0x43f7ff,
  pink: 0xff4fd8,
  yellow: 0xffee72,
  green: 0x74ff8a,
  danger: 0xff506d
};

export const getBossById = (id: string): BossConfig => {
  const boss = BOSSES.find((entry) => entry.id === id);
  return boss ?? BOSSES[0];
};
