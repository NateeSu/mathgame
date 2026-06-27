import Phaser from "phaser";
import { BOSSES, COLORS, SCENE_KEYS } from "../constants";
import type { BossConfig } from "../types";

const textureForBoss = (boss: BossConfig) => {
  if (boss.id === "slime_king") return "boss-slime";
  if (boss.id === "magma_ogre") return "boss-magma";
  return "boss-cyber";
};

export class BossSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.bossSelect);
  }

  create() {
    this.add.rectangle(195, 422, 390, 844, 0x101033);
    this.add
      .text(195, 78, "เลือกบอส", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    BOSSES.forEach((boss, index) => this.createBossCard(boss, 184 + index * 178));
    this.createBackButton();
  }

  private createBossCard(boss: BossConfig, y: number) {
    const card = this.add
      .rectangle(195, y, 326, 136, 0x21184f, 0.96)
      .setStrokeStyle(3, boss.accent, 0.78)
      .setInteractive({ useHandCursor: true });
    this.add.sprite(91, y, textureForBoss(boss)).setDisplaySize(86, 86);
    this.add
      .text(160, y - 34, boss.displayName, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "23px",
        color: "#ffffff",
        fontStyle: "900"
      })
      .setOrigin(0, 0.5);
    this.add
      .text(160, y + 1, `HP ${boss.hp} • พลังแนะนำ L${boss.preferredPowerLevel}`, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "16px",
        color: "#ffee72",
        fontStyle: "700"
      })
      .setOrigin(0, 0.5);
    this.add
      .text(160, y + 34, boss.theme, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "14px",
        color: "#b7b5ff"
      })
      .setOrigin(0, 0.5);

    card.on("pointerdown", () => {
      this.scene.start(SCENE_KEYS.battle, { bossId: boss.id });
    });
  }

  private createBackButton() {
    const back = this.add
      .rectangle(195, 756, 210, 48, COLORS.cyan, 0.86)
      .setStrokeStyle(3, 0xffffff, 0.35)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(195, 756, "กลับเมนู", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "20px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    back.on("pointerdown", () => this.scene.start(SCENE_KEYS.menu));
  }
}
