import { describe, expect, test } from "vitest";
import { BOSSES } from "../src/game/constants";
import { BOSS_AIMED_TRAVEL_MS, BOSS_AIMED_VOLLEY_INTERVAL_MS } from "../src/game/systems/BattleRules";

describe("boss tuning", () => {
  test("boss projectiles use fast aimed travel", () => {
    expect(BOSS_AIMED_TRAVEL_MS).toBe(500);
  });

  test("all bosses launch aimed volleys every second", () => {
    expect(BOSS_AIMED_VOLLEY_INTERVAL_MS).toBe(1_000);
  });

  test("boss configs still provide projectile art for each monster", () => {
    expect(BOSSES.map((boss) => boss.projectileTexture)).toEqual(["slime-shot", "magma-shot", "cyber-shot"]);
  });
});
