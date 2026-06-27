import Phaser from "phaser";
import { SCENE_KEYS } from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  preload() {
    this.load.image("arena-bg", "/assets/generated/arena-bg.png");
    this.load.image("player", "/assets/generated/hero.png");
    this.load.image("boss-slime", "/assets/generated/slime-king.png");
    this.load.image("boss-magma", "/assets/generated/magma-ogre.png");
    this.load.image("boss-cyber", "/assets/generated/cyber-dragon.png");
    this.load.image("math-blast", "/assets/generated/math-blast.png");
  }

  create() {
    this.createFallbackTextures();
    this.scene.start(SCENE_KEYS.menu);
  }

  private createFallbackTextures() {
    this.createOrbTexture("slime-shot", 0x74ff8a, 0x1f8d4b);
    this.createOrbTexture("magma-shot", 0xff9b3d, 0xff3d46);
    this.createOrbTexture("cyber-shot", 0x43f7ff, 0xf854ff);
  }

  private createOrbTexture(key: string, core: number, rim: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(rim, 0.45);
    graphics.fillCircle(18, 18, 17);
    graphics.fillStyle(core, 1);
    graphics.fillCircle(18, 18, 10);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillCircle(14, 13, 4);
    graphics.generateTexture(key, 36, 36);
    graphics.destroy();
  }
}
