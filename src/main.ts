import Phaser from "phaser";
import "./style.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/config";
import { BattleScene } from "./game/scenes/BattleScene";
import { BootScene } from "./game/scenes/BootScene";
import { BossSelectScene } from "./game/scenes/BossSelectScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { ResultScene } from "./game/scenes/ResultScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#101033",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, BossSelectScene, BattleScene, ResultScene]
};

new Phaser.Game(config);
