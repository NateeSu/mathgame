import { describe, expect, test } from "vitest";
import { BOSSES } from "../src/game/constants";

describe("boss tuning", () => {
  test("boss projectiles are fast enough to pressure the player", () => {
    expect(BOSSES.map((boss) => boss.projectileSpeed)).toEqual([620, 760, 920]);
  });

  test("stronger bosses attack more frequently", () => {
    expect(BOSSES.map((boss) => boss.fireRateMs)).toEqual([760, 600, 460]);
  });
});
