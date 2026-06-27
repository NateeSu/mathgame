import Phaser from "phaser";
import { COLORS, SCENE_KEYS } from "../constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.menu);
  }

  create() {
    this.drawBackground();
    this.add
      .text(195, 112, "Math Blaster", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 7
      })
      .setOrigin(0.5);
    this.add
      .text(195, 158, "Boss Academy", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "30px",
        color: "#ffee72",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    const hero = this.add.sprite(196, 304, "player").setDisplaySize(168, 206);
    this.tweens.add({
      targets: hero,
      y: 292,
      angle: { from: -2, to: 2 },
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: "Sine.easeInOut"
    });

    this.add
      .text(195, 428, "หลบพลังบอส ตอบโจทย์ แล้วปล่อยพลังคณิต!", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 320 }
      })
      .setOrigin(0.5);

    this.createButton(195, 532, "เริ่มเกม", () => this.scene.start(SCENE_KEYS.bossSelect));
    this.createButton(195, 604, "วิธีเล่น", () => this.showHowTo());

    this.add
      .text(195, 706, "สร้างแอพโดยพ่อน๊อต", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "22px",
        color: "#43f7ff",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 5
      })
      .setOrigin(0.5);
  }

  private drawBackground() {
    this.add.rectangle(195, 422, 390, 844, 0x101033);
    for (let i = 0; i < 44; i += 1) {
      const x = Phaser.Math.Between(12, 378);
      const y = Phaser.Math.Between(24, 808);
      const color = i % 3 === 0 ? COLORS.cyan : i % 3 === 1 ? COLORS.pink : COLORS.yellow;
      this.add.rectangle(x, y, 3, 3, color, 0.55);
    }
    this.add.circle(195, 304, 142, 0x43f7ff, 0.14);
    this.add.circle(195, 304, 102, 0xff4fd8, 0.13);
  }

  private createButton(x: number, y: number, label: string, onTap: () => void) {
    const bg = this.add
      .rectangle(x, y, 254, 56, COLORS.yellow, 0.92)
      .setStrokeStyle(4, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "24px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    bg.on("pointerdown", () => {
      this.tweens.add({ targets: [bg, text], scale: 0.96, yoyo: true, duration: 80 });
      onTap();
    });
  }

  private showHowTo() {
    const panel = this.add.container(0, 0).setDepth(30);
    const dim = this.add.rectangle(195, 422, 390, 844, 0x070719, 0.72);
    const box = this.add
      .rectangle(195, 420, 334, 392, COLORS.panel, 0.98)
      .setStrokeStyle(4, COLORS.cyan, 0.8);
    const copy = this.add
      .text(
        195,
        392,
        "◀ ▶ เพื่อขยับ\n⚡ เพื่อ Dash หลบกระสุน\nกด L1 L2 L3 เพื่อเปิดโจทย์\nตอบถูกแล้วพลังจะโจมตีบอส\nเอา HP บอสให้หมดก่อน!",
        {
          fontFamily: "Tahoma, sans-serif",
          fontSize: "22px",
          color: "#ffffff",
          align: "center",
          lineSpacing: 9,
          wordWrap: { width: 284 }
        }
      )
      .setOrigin(0.5);
    const close = this.add
      .rectangle(195, 606, 184, 50, COLORS.green, 0.9)
      .setInteractive({ useHandCursor: true });
    const closeText = this.add
      .text(195, 606, "เข้าใจแล้ว", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "21px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    close.on("pointerdown", () => panel.destroy(true));
    panel.add([dim, box, copy, close, closeText]);
  }
}
