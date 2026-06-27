import { describe, expect, test } from "vitest";
import {
  createAimedBossVolley,
  calculateAimedProjectileVelocity,
  getPowerVisualProfile,
  shouldBossFire,
  type BossFireState
} from "../src/game/systems/BattleRules";

describe("BattleRules", () => {
  test("boss firing is not paused by the math modal", () => {
    const state: BossFireState = {
      gameEnded: false,
      nowMs: 2_000,
      nextShotAtMs: 1_500,
      mathModalOpen: true
    };

    expect(shouldBossFire(state)).toBe(true);
  });

  test("boss firing stops only before cooldown or after the battle ends", () => {
    expect(
      shouldBossFire({ gameEnded: false, nowMs: 1_000, nextShotAtMs: 1_500, mathModalOpen: false })
    ).toBe(false);
    expect(
      shouldBossFire({ gameEnded: true, nowMs: 2_000, nextShotAtMs: 1_500, mathModalOpen: false })
    ).toBe(false);
  });

  test("higher power levels have bigger and longer visual profiles", () => {
    const level1 = getPowerVisualProfile(1);
    const level2 = getPowerVisualProfile(2);
    const level3 = getPowerVisualProfile(3);

    expect(level2.shotWidth).toBeGreaterThan(level1.shotWidth);
    expect(level3.shotWidth).toBeGreaterThan(level2.shotWidth);
    expect(level2.impactWidth).toBeGreaterThan(level1.impactWidth);
    expect(level3.impactWidth).toBeGreaterThan(level2.impactWidth);
    expect(level2.beamCount).toBeGreaterThan(level1.beamCount);
    expect(level3.beamCount).toBeGreaterThan(level2.beamCount);
    expect(level3.shakeIntensity).toBeGreaterThan(level1.shakeIntensity);
  });

  test("aimed projectile reaches the player after the requested travel time", () => {
    const velocity = calculateAimedProjectileVelocity({
      startX: 80,
      startY: 240,
      targetX: 220,
      targetY: 640,
      travelMs: 500
    });

    expect(80 + velocity.velocityX * 0.5).toBe(220);
    expect(240 + velocity.velocityY * 0.5).toBe(640);
  });

  test("aimed boss volleys attack from arena directions instead of clustering around the boss", () => {
    const first = createAimedBossVolley({
      volleyIndex: 0,
      bossX: 195,
      bossY: 236,
      targetX: 190,
      targetY: 636,
      travelMs: 500
    });
    const second = createAimedBossVolley({
      volleyIndex: 1,
      bossX: 195,
      bossY: 236,
      targetX: 190,
      targetY: 636,
      travelMs: 500
    });

    expect(first).toHaveLength(3);
    expect(second).toHaveLength(3);
    expect(first.map((shot) => shot.startX)).not.toEqual(second.map((shot) => shot.startX));
    expect(first.some((shot) => Math.abs(shot.startX - 195) > 120)).toBe(true);
    expect(second.some((shot) => shot.startY > 340)).toBe(true);
    [...first, ...second].forEach((shot) => {
      expect(Math.round(shot.startX + shot.velocityX * 0.5)).toBe(190);
      expect(Math.round(shot.startY + shot.velocityY * 0.5)).toBe(636);
    });
  });
});
