import { describe, expect, test } from "vitest";
import { RENDER_LAYERS } from "../src/game/systems/RenderLayers";

describe("RenderLayers", () => {
  test("boss projectiles stay visible in battle but cannot cover answer choices", () => {
    expect(RENDER_LAYERS.bossProjectile).toBeGreaterThan(RENDER_LAYERS.player);
    expect(RENDER_LAYERS.bossProjectile).toBeLessThan(RENDER_LAYERS.mathModal);
  });
});
