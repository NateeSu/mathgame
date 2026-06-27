import { describe, expect, test } from "vitest";
import {
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
});
