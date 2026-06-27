import Phaser from "phaser";
import type { PowerLevel } from "../types";

type ControlCallbacks = {
  onLeft: (active: boolean) => void;
  onRight: (active: boolean) => void;
  onDash: () => void;
  onPower: (level: PowerLevel) => void;
};

export class MobileControls {
  private readonly group: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: ControlCallbacks) {
    this.group = scene.add.container(0, 0).setDepth(20);
    this.createHoldButton(scene, 42, 782, "◀", 0x43f7ff, (active) => callbacks.onLeft(active));
    this.createHoldButton(scene, 104, 782, "▶", 0x43f7ff, (active) => callbacks.onRight(active));
    this.createTapButton(scene, 181, 782, "⚡", 0xffee72, callbacks.onDash);
    this.createTapButton(scene, 262, 782, "L1", 0x74ff8a, () => callbacks.onPower(1));
    this.createTapButton(scene, 314, 782, "L2", 0xff9b3d, () => callbacks.onPower(2));
    this.createTapButton(scene, 361, 782, "L3", 0xff4fd8, () => callbacks.onPower(3), 46);
  }

  setVisible(visible: boolean) {
    this.group.setVisible(visible);
  }

  private createTapButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    color: number,
    onTap: () => void,
    width = 48
  ) {
    const button = this.buttonBase(scene, x, y, width, 54, color, label);
    button.background.on("pointerdown", () => {
      this.flash(scene, button.background);
      onTap();
    });
  }

  private createHoldButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    color: number,
    onHold: (active: boolean) => void
  ) {
    const button = this.buttonBase(scene, x, y, 56, 54, color, label);
    button.background.on("pointerdown", () => {
      button.background.setAlpha(0.95);
      onHold(true);
    });
    button.background.on("pointerup", () => {
      button.background.setAlpha(0.72);
      onHold(false);
    });
    button.background.on("pointerout", () => {
      button.background.setAlpha(0.72);
      onHold(false);
    });
  }

  private buttonBase(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    label: string
  ) {
    const background = scene.add
      .rectangle(x, y, width, height, color, 0.72)
      .setStrokeStyle(3, 0xffffff, 0.35)
      .setInteractive({ useHandCursor: true });
    const text = scene.add
      .text(x, y, label, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: label.length > 1 ? "18px" : "25px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    this.group.add([background, text]);
    return { background, text };
  }

  private flash(scene: Phaser.Scene, target: Phaser.GameObjects.Rectangle) {
    scene.tweens.add({
      targets: target,
      alpha: { from: 1, to: 0.72 },
      duration: 150
    });
  }
}
