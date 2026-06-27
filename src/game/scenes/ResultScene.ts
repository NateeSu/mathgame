import Phaser from "phaser";
import { COLORS, getBossById, SCENE_KEYS } from "../constants";
import type { BattleResult } from "../types";

export class ResultScene extends Phaser.Scene {
  private result!: BattleResult;

  constructor() {
    super(SCENE_KEYS.result);
  }

  init(data: BattleResult) {
    this.result = data;
  }

  create() {
    const boss = getBossById(this.result.bossId);
    this.add.rectangle(195, 422, 390, 844, 0x101033);
    this.add.circle(195, 194, 126, this.result.won ? COLORS.green : COLORS.danger, 0.13);
    this.add
      .text(195, 126, this.result.won ? "ชนะแล้ว!" : "แพ้แล้ว", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "42px",
        color: this.result.won ? "#74ff8a" : "#ff9b3d",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 7
      })
      .setOrigin(0.5);
    this.add
      .text(195, 186, boss.displayName, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "25px",
        color: "#ffffff",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    this.add
      .text(195, 248, this.starText(), {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "34px",
        color: "#ffee72",
        fontStyle: "900"
      })
      .setOrigin(0.5);

    const stats =
      `ตอบถูก ${this.result.correctAnswers}\n` +
      `ตอบผิด ${this.result.wrongAnswers}\n` +
      `ความแม่นยำ ${Math.round(this.result.accuracy * 100)}%\n` +
      `ทำดาเมจ ${this.result.damageDealt}\n` +
      `เสีย HP ${this.result.damageTaken}\n` +
      `HP เหลือ ${Math.max(0, this.result.remainingHp)}`;
    this.add
      .text(195, 424, stats, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 8
      })
      .setOrigin(0.5);

    this.add
      .text(
        195,
        594,
        this.result.won ? "เก่งมาก! ลองบอสตัวต่อไปได้เลย" : "ลองใช้ Dash หลบกระสุน แล้วใช้ L1 เมื่ออยากโจมตีเร็ว",
        {
          fontFamily: "Tahoma, sans-serif",
          fontSize: "18px",
          color: "#b7b5ff",
          align: "center",
          wordWrap: { width: 310 }
        }
      )
      .setOrigin(0.5);

    this.button(195, 690, "เลือกบอส", () => this.scene.start(SCENE_KEYS.bossSelect), COLORS.yellow);
    this.button(195, 758, "เมนูหลัก", () => this.scene.start(SCENE_KEYS.menu), COLORS.cyan);
  }

  private starText() {
    if (this.result.stars <= 0) return "ลองใหม่อีกครั้ง";
    return "★".repeat(this.result.stars) + "☆".repeat(3 - this.result.stars);
  }

  private button(x: number, y: number, label: string, onTap: () => void, color: number) {
    const bg = this.add
      .rectangle(x, y, 224, 52, color, 0.9)
      .setStrokeStyle(3, 0xffffff, 0.35)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "21px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    bg.on("pointerdown", onTap);
  }
}
