import Phaser from "phaser";

export class HealthBar {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly width: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    label: string,
    fillColor: number
  ) {
    this.width = width;
    this.background = scene.add
      .rectangle(x, y, width, 18, 0x0b0921, 0.94)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0xffffff, 0.22);
    this.fill = scene.add.rectangle(x + 3, y, width - 6, 12, fillColor).setOrigin(0, 0.5);
    this.label = scene.add.text(x, y - 24, label, {
      fontFamily: "Tahoma, sans-serif",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "700"
    });
  }

  setValue(current: number, max: number) {
    const ratio = Phaser.Math.Clamp(current / max, 0, 1);
    this.fill.displayWidth = (this.width - 6) * ratio;
  }

  setLabel(text: string) {
    this.label.setText(text);
  }

  setVisible(visible: boolean) {
    this.background.setVisible(visible);
    this.fill.setVisible(visible);
    this.label.setVisible(visible);
  }
}
