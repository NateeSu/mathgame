import type { PowerLevel } from "../types";

export type BossFireState = {
  gameEnded: boolean;
  nowMs: number;
  nextShotAtMs: number;
  mathModalOpen: boolean;
};

export type PowerVisualProfile = {
  level: PowerLevel;
  shotWidth: number;
  shotHeight: number;
  shotDurationMs: number;
  beamCount: number;
  impactWidth: number;
  impactHeight: number;
  impactDurationMs: number;
  shockwaveRadius: number;
  shakeDurationMs: number;
  shakeIntensity: number;
  burstParticles: number;
};

export type AimedProjectileInput = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  travelMs: number;
};

export type AimedProjectilePlan = {
  startX: number;
  startY: number;
  velocityX: number;
  velocityY: number;
};

export type AimedBossVolleyInput = {
  volleyIndex: number;
  bossX: number;
  bossY: number;
  targetX: number;
  targetY: number;
  travelMs: number;
};

export const BOSS_AIMED_TRAVEL_MS = 1_000;
export const BOSS_AIMED_VOLLEY_INTERVAL_MS = 1_000;

export const shouldBossFire = (state: BossFireState): boolean => {
  if (state.gameEnded) return false;
  return state.nowMs >= state.nextShotAtMs;
};

export const calculateAimedProjectileVelocity = ({
  startX,
  startY,
  targetX,
  targetY,
  travelMs
}: AimedProjectileInput): Pick<AimedProjectilePlan, "velocityX" | "velocityY"> => {
  const travelSeconds = travelMs / 1_000;
  return {
    velocityX: (targetX - startX) / travelSeconds,
    velocityY: (targetY - startY) / travelSeconds
  };
};

export const createAimedBossVolley = ({
  volleyIndex,
  bossX,
  bossY,
  targetX,
  targetY,
  travelMs
}: AimedBossVolleyInput): AimedProjectilePlan[] => {
  const directionSets = [
    [
      { x: 0, y: 58 },
      { x: -122, y: 92 },
      { x: 122, y: 92 }
    ],
    [
      { x: -148, y: 36 },
      { x: 0, y: 74 },
      { x: 148, y: 36 }
    ],
    [
      { x: -92, y: 28 },
      { x: 92, y: 28 },
      { x: 0, y: 118 }
    ]
  ];
  const offsets = directionSets[volleyIndex % directionSets.length];

  return offsets.map((offset) => {
    const startX = bossX + offset.x;
    const startY = bossY + offset.y;
    const velocity = calculateAimedProjectileVelocity({ startX, startY, targetX, targetY, travelMs });
    return {
      startX,
      startY,
      ...velocity
    };
  });
};

export const getPowerVisualProfile = (level: PowerLevel): PowerVisualProfile => {
  const profiles: Record<PowerLevel, PowerVisualProfile> = {
    1: {
      level: 1,
      shotWidth: 110,
      shotHeight: 138,
      shotDurationMs: 500,
      beamCount: 2,
      impactWidth: 260,
      impactHeight: 326,
      impactDurationMs: 560,
      shockwaveRadius: 124,
      shakeDurationMs: 160,
      shakeIntensity: 0.008,
      burstParticles: 12
    },
    2: {
      level: 2,
      shotWidth: 150,
      shotHeight: 188,
      shotDurationMs: 580,
      beamCount: 3,
      impactWidth: 360,
      impactHeight: 450,
      impactDurationMs: 720,
      shockwaveRadius: 166,
      shakeDurationMs: 230,
      shakeIntensity: 0.012,
      burstParticles: 18
    },
    3: {
      level: 3,
      shotWidth: 205,
      shotHeight: 256,
      shotDurationMs: 680,
      beamCount: 5,
      impactWidth: 500,
      impactHeight: 625,
      impactDurationMs: 940,
      shockwaveRadius: 220,
      shakeDurationMs: 320,
      shakeIntensity: 0.017,
      burstParticles: 28
    }
  };

  return profiles[level];
};
