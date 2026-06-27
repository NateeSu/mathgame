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

export const shouldBossFire = (state: BossFireState): boolean => {
  if (state.gameEnded) return false;
  return state.nowMs >= state.nextShotAtMs;
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
