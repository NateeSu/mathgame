import Phaser from "phaser";

export const showDamageNumber = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = "#ffee72"
) => {
  const label = scene.add
    .text(x, y, text, {
      fontFamily: "Tahoma, sans-serif",
      fontSize: "24px",
      color,
      fontStyle: "900",
      stroke: "#101033",
      strokeThickness: 5
    })
    .setOrigin(0.5);

  scene.tweens.add({
    targets: label,
    y: y - 42,
    alpha: 0,
    scale: 1.28,
    duration: 760,
    ease: "Cubic.easeOut",
    onComplete: () => label.destroy()
  });
};
