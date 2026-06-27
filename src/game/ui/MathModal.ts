import Phaser from "phaser";
import type { AnswerChoice, MathQuestion } from "../systems/MathQuestionSystem";
import { generateAnswerChoices } from "../systems/MathQuestionSystem";
import { RENDER_LAYERS } from "../systems/RenderLayers";

type MathModalCallbacks = {
  onCorrect: () => void;
  onWrong: () => void;
  onClose: () => void;
};

export class MathModal {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly question: MathQuestion;
  private readonly callbacks: MathModalCallbacks;
  private readonly choices: AnswerChoice[];
  private feedbackText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, question: MathQuestion, callbacks: MathModalCallbacks) {
    this.scene = scene;
    this.question = question;
    this.callbacks = callbacks;
    this.choices = generateAnswerChoices(question);
    this.container = scene.add.container(0, 0).setDepth(RENDER_LAYERS.mathModal);
    this.createShell();
  }

  destroy() {
    this.container.destroy(true);
  }

  handleKey(event: KeyboardEvent) {
    const choiceIndex = Number.parseInt(event.key, 10) - 1;
    if (choiceIndex >= 0 && choiceIndex < this.choices.length) {
      this.choose(this.choices[choiceIndex]);
    }
  }

  private createShell() {
    const dim = this.scene.add.rectangle(195, 422, 390, 844, 0x070719, 0.32);
    const panel = this.scene.add
      .rectangle(195, 318, 326, 416, 0x21184f, 0.9)
      .setStrokeStyle(3, 0x43f7ff, 0.9);
    const title = this.scene.add
      .text(195, 130, "เลือกคำตอบให้ถูกต้อง", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    const prompt = this.scene.add
      .text(195, 178, this.question.prompt, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "32px",
        color: "#ffee72",
        fontStyle: "900",
        stroke: "#101033",
        strokeThickness: 5
      })
      .setOrigin(0.5);

    this.feedbackText = this.scene.add
      .text(195, 218, "กด 1-4 หรือแตะคำตอบ", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "15px",
        color: "#b7b5ff",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.container.add([dim, panel, title, prompt, this.feedbackText]);
    this.createChoices();
    this.createButton(195, 546, 184, 40, "ยกเลิก", 0xb7b5ff, this.callbacks.onClose);
  }

  private createChoices() {
    this.choices.forEach((choice, index) => {
      const y = 278 + index * 58;
      this.createButton(195, y, 268, 44, `${index + 1}. ${choice.label}`, 0x43f7ff, () => this.choose(choice));
    });
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onTap: () => void
  ) {
    const background = this.scene.add
      .rectangle(x, y, width, height, color, 0.88)
      .setStrokeStyle(3, 0xffffff, 0.32)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: "Tahoma, sans-serif",
        fontSize: label.length > 12 ? "17px" : "21px",
        color: "#101033",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    background.on("pointerdown", () => {
      this.scene.tweens.add({ targets: background, alpha: { from: 1, to: 0.88 }, duration: 120 });
      onTap();
    });
    this.container.add([background, text]);
  }

  private choose(choice: AnswerChoice) {
    if (choice.correct) {
      this.callbacks.onCorrect();
      return;
    }

    this.feedbackText.setText("ลองอีกครั้ง!");
    this.scene.cameras.main.shake(120, 0.004);
    this.callbacks.onWrong();
  }
}
