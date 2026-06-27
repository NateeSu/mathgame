import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import {
  BOSSES,
  COLORS,
  getBossById,
  PLAYER_STATS,
  POWER_COOLDOWN_MS,
  POWER_DAMAGE,
  SCENE_KEYS
} from "../constants";
import {
  BOSS_AIMED_TRAVEL_MS,
  BOSS_AIMED_VOLLEY_INTERVAL_MS,
  createAimedBossVolley,
  getPowerVisualProfile,
  shouldBossFire,
  type AimedProjectilePlan,
  type PowerVisualProfile
} from "../systems/BattleRules";
import { generateMathQuestion } from "../systems/MathQuestionSystem";
import { RENDER_LAYERS } from "../systems/RenderLayers";
import { showDamageNumber } from "../ui/DamageNumber";
import { HealthBar } from "../ui/HealthBar";
import { MathModal } from "../ui/MathModal";
import { MobileControls } from "../ui/MobileControls";
import type { BattleResult, BossConfig, BossId, PowerLevel } from "../types";

type BattleInitData = {
  bossId?: BossId;
};

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

const bossTexture = (boss: BossConfig) => {
  if (boss.id === "slime_king") return "boss-slime";
  if (boss.id === "magma_ogre") return "boss-magma";
  return "boss-cyber";
};

export class BattleScene extends Phaser.Scene {
  private boss!: BossConfig;
  private player!: Phaser.Physics.Arcade.Sprite;
  private bossSprite!: Phaser.GameObjects.Sprite;
  private heroProjectiles!: Phaser.Physics.Arcade.Group;
  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  private playerBar!: HealthBar;
  private bossBar!: HealthBar;
  private cursors?: CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private mathModal?: MathModal;
  private moveDirection = 0;
  private playerHp = PLAYER_STATS.hp;
  private bossHp = 0;
  private correctAnswers = 0;
  private wrongAnswers = 0;
  private damageDealt = 0;
  private damageTaken = 0;
  private combo = 0;
  private invulnerableUntil = 0;
  private dashUntil = 0;
  private dashReadyAt = 0;
  private nextBossShotAt = 0;
  private bossVolleyIndex = 0;
  private gameEnded = false;
  private powerReadyAt: Record<PowerLevel, number> = { 1: 0, 2: 0, 3: 0 };
  private statusText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private cooldownText!: Phaser.GameObjects.Text;
  private aura!: Phaser.GameObjects.Image;

  constructor() {
    super(SCENE_KEYS.battle);
  }

  init(data: BattleInitData) {
    this.boss = getBossById(data.bossId ?? BOSSES[0].id);
    this.playerHp = PLAYER_STATS.hp;
    this.bossHp = this.boss.hp;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.combo = 0;
    this.invulnerableUntil = 0;
    this.dashUntil = 0;
    this.dashReadyAt = 0;
    this.nextBossShotAt = 0;
    this.bossVolleyIndex = 0;
    this.gameEnded = false;
    this.powerReadyAt = { 1: 0, 2: 0, 3: 0 };
  }

  create() {
    this.drawArena();
    this.createHud();
    this.createActors();
    this.createControls();
    this.createKeyboard();
    this.createPhysics();
    this.updateBars();
    this.statusText.setText("หลบกระสุน แล้วกด L1 L2 L3!");
  }

  update(time: number) {
    if (this.gameEnded) return;

    this.updatePlayer(time);
    this.updateBoss(time);
    this.updateProjectiles();
    this.updateCooldownText(time);
  }

  private drawArena() {
    this.add.rectangle(195, 422, GAME_WIDTH, GAME_HEIGHT, 0x101033);
    this.add.image(195, 422, "arena-bg").setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(0);
    this.add.rectangle(195, 422, GAME_WIDTH, GAME_HEIGHT, 0x040416, 0.18).setDepth(1);
    this.add.rectangle(195, 430, 344, 548, 0x0b0921, 0.24).setStrokeStyle(4, 0x43f7ff, 0.34).setDepth(2);
    this.add.circle(195, 286, 124, this.boss.color, 0.1).setDepth(2);
    this.add.circle(195, 626, 104, COLORS.cyan, 0.08).setDepth(2);
  }

  private createHud() {
    this.bossBar = new HealthBar(this, 28, 66, 334, `Boss: ${this.boss.displayName}`, this.boss.color);
    this.playerBar = new HealthBar(this, 28, 116, 334, "Player HP", COLORS.green);
    this.comboText = this.add
      .text(28, 142, "Combo 0", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "16px",
        color: "#ffee72",
        fontStyle: "900"
      })
      .setOrigin(0, 0.5);
    this.statusText = this.add
      .text(195, 704, "", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "17px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 340 }
      })
      .setOrigin(0.5);
    this.cooldownText = this.add
      .text(195, 736, "", {
        fontFamily: "Tahoma, sans-serif",
        fontSize: "14px",
        color: "#b7b5ff",
        align: "center"
      })
      .setOrigin(0.5);
  }

  private createActors() {
    const bossSize = this.boss.id === "slime_king" ? 150 : this.boss.id === "magma_ogre" ? 164 : 178;
    this.bossSprite = this.add.sprite(195, 236, bossTexture(this.boss)).setDisplaySize(bossSize, bossSize).setDepth(5);
    this.aura = this.add.image(195, 236, "math-blast").setAlpha(0.16).setDisplaySize(220, 220).setDepth(4);
    this.tweens.add({
      targets: [this.bossSprite, this.aura],
      y: 244,
      yoyo: true,
      repeat: -1,
      duration: 880,
      ease: "Sine.easeInOut"
    });
    this.tweens.add({
      targets: this.aura,
      angle: 360,
      repeat: -1,
      duration: 5000
    });

    this.player = this.physics.add.sprite(195, 636, "player").setDisplaySize(72, 88).setDepth(RENDER_LAYERS.player);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(30, 42, true);
  }

  private createControls() {
    new MobileControls(this, {
      onLeft: (active) => {
        this.moveDirection = active ? -1 : this.moveDirection === -1 ? 0 : this.moveDirection;
      },
      onRight: (active) => {
        this.moveDirection = active ? 1 : this.moveDirection === 1 ? 0 : this.moveDirection;
      },
      onDash: () => this.tryDash(this.time.now),
      onPower: (level) => this.tryPower(level, this.time.now)
    });
  }

  private createKeyboard() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys("A,D,SPACE,ONE,TWO,THREE,ESC") as
      | Record<string, Phaser.Input.Keyboard.Key>
      | undefined;
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.mathModal) {
        if (event.key === "Escape") {
          this.closeMathModal();
        } else if (event.key === " " || event.code === "Space") {
          this.tryDash(this.time.now);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key.toLowerCase() === "a" || event.key.toLowerCase() === "d") {
          return;
        } else {
          this.mathModal.handleKey(event);
        }
        return;
      }

      if (event.key === "1") this.tryPower(1, this.time.now);
      if (event.key === "2") this.tryPower(2, this.time.now);
      if (event.key === "3") this.tryPower(3, this.time.now);
      if (event.key === " " || event.code === "Space") this.tryDash(this.time.now);
      if (event.key === "Escape") this.scene.start(SCENE_KEYS.bossSelect);
    });
  }

  private createPhysics() {
    this.heroProjectiles = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bossProjectiles, (_player, projectile) => {
      this.handlePlayerHit(projectile as Phaser.Physics.Arcade.Image, this.time.now);
    });
  }

  private updatePlayer(time: number) {
    let direction = this.moveDirection;
    if (this.cursors?.left.isDown || this.keys?.A.isDown) direction = -1;
    if (this.cursors?.right.isDown || this.keys?.D.isDown) direction = 1;

    const dashing = time < this.dashUntil;
    const speed = dashing ? PLAYER_STATS.dashSpeed : PLAYER_STATS.moveSpeed;
    this.player.setVelocityX(direction * speed);
    this.player.setTint(dashing ? 0xffee72 : time < this.invulnerableUntil ? 0xff8fb3 : 0xffffff);

    const dashKey = this.cursors?.space ?? this.keys?.SPACE;
    if (dashKey && Phaser.Input.Keyboard.JustDown(dashKey)) {
      this.tryDash(time);
    }
  }

  private updateBoss(time: number) {
    if (!shouldBossFire({ gameEnded: this.gameEnded, nowMs: time, nextShotAtMs: this.nextBossShotAt, mathModalOpen: Boolean(this.mathModal) })) {
      return;
    }

    this.fireBossPattern();
    this.nextBossShotAt = time + BOSS_AIMED_VOLLEY_INTERVAL_MS;
  }

  private updateProjectiles() {
    this.bossProjectiles.children.each((child) => {
      const image = child as Phaser.Physics.Arcade.Image;
      if (image.y > 724 || image.x < 8 || image.x > 382) image.destroy();
      return true;
    });
    this.heroProjectiles.children.each((child) => {
      const image = child as Phaser.Physics.Arcade.Image;
      if (image.y < 120) image.destroy();
      return true;
    });
  }

  private tryDash(time: number) {
    if (time < this.dashReadyAt) return;
    this.dashUntil = time + PLAYER_STATS.dashDurationMs;
    this.dashReadyAt = time + PLAYER_STATS.dashCooldownMs;
    this.statusText.setText("Dash!");
    this.burstAt(this.player.x, this.player.y, COLORS.cyan, 0.45);
    this.cameras.main.flash(80, 67, 247, 255, false);
  }

  private tryPower(level: PowerLevel, time: number) {
    if (this.mathModal || time < this.powerReadyAt[level]) return;
    this.powerReadyAt[level] = time + POWER_COOLDOWN_MS[level];
    const question = generateMathQuestion(level);
    this.statusText.setText(`พลังระดับ ${level}: ตอบโจทย์ก่อนโจมตี`);
    this.mathModal = new MathModal(this, question, {
      onCorrect: () => {
        this.closeMathModal();
        this.resolveCorrectPower(level);
      },
      onWrong: () => this.resolveWrongAnswer(),
      onClose: () => this.closeMathModal()
    });
  }

  private closeMathModal() {
    this.mathModal?.destroy();
    this.mathModal = undefined;
  }

  private resolveCorrectPower(level: PowerLevel) {
    this.correctAnswers += 1;
    this.combo += 1;
    let damage = POWER_DAMAGE[level] + Math.min(this.combo * 2, 14);
    if (this.boss.id === "cyber_dragon" && this.bossHp <= this.boss.hp * (this.boss.shieldAt ?? 0) && level < 3) {
      damage = Math.ceil(damage * 0.5);
      this.statusText.setText("ถูกต้อง! แต่เกราะ Cyber Dragon ลดดาเมจ");
    } else {
      this.statusText.setText("ถูกต้อง! ปล่อยพลัง!");
    }
    this.fireHeroShot(level, damage);
    this.comboText.setText(`Combo ${this.combo}`);
  }

  private resolveWrongAnswer() {
    this.wrongAnswers += 1;
    this.combo = 0;
    this.comboText.setText("Combo 0");
    this.takeDamage(3);
  }

  private fireHeroShot(level: PowerLevel, damage: number) {
    const profile = getPowerVisualProfile(level);
    this.chargePower(profile);
    this.createPowerBeam(profile);

    const shot = this.physics.add.image(this.player.x, this.player.y - 58, "math-blast").setDepth(9);
    shot.setDisplaySize(profile.shotWidth, profile.shotHeight);
    shot.setBlendMode(Phaser.BlendModes.ADD);
    this.heroProjectiles.add(shot);
    this.tweens.add({
      targets: shot,
      x: this.bossSprite.x,
      y: this.bossSprite.y + 20,
      angle: 360 + level * 220,
      displayWidth: profile.shotWidth * 1.52,
      displayHeight: profile.shotHeight * 1.52,
      duration: profile.shotDurationMs,
      ease: "Quart.easeIn",
      onComplete: () => {
        shot.destroy();
        this.applyBossDamage(damage, profile);
      }
    });
  }

  private applyBossDamage(damage: number, profile: PowerVisualProfile) {
    this.bossHp = Math.max(0, this.bossHp - damage);
    this.damageDealt += damage;
    this.updateBars();
    showDamageNumber(this, this.bossSprite.x, this.bossSprite.y - 34, `-${damage}`);
    this.playBossHurtReaction(profile);
    this.impactBurst(this.bossSprite.x, this.bossSprite.y + 12, profile);
    this.cameras.main.shake(profile.shakeDurationMs, profile.shakeIntensity);
    this.cameras.main.flash(120, 255, 245, 132, false);

    if (this.bossHp <= 0) {
      this.finishBattle(true);
    }
  }

  private fireBossPattern() {
    const volley = createAimedBossVolley({
      volleyIndex: this.bossVolleyIndex,
      bossX: this.bossSprite.x,
      bossY: this.bossSprite.y,
      targetX: this.player.x,
      targetY: this.player.y,
      travelMs: BOSS_AIMED_TRAVEL_MS
    });
    this.bossVolleyIndex += 1;
    volley.forEach((projectile, index) => {
      this.time.delayedCall(index * 80, () => this.spawnAimedBossProjectile(projectile));
    });
  }

  private spawnAimedBossProjectile(projectile: AimedProjectilePlan) {
    const shot = this.physics.add.image(projectile.startX, projectile.startY, this.boss.projectileTexture).setDepth(RENDER_LAYERS.bossProjectile);
    shot.setBlendMode(Phaser.BlendModes.ADD);
    shot.setVelocity(projectile.velocityX, projectile.velocityY);
    shot.setAngularVelocity(Phaser.Math.Between(-240, 240));
    shot.body?.setSize(22, 22, true);
    this.bossProjectiles.add(shot);
  }

  private chargePower(profile: PowerVisualProfile) {
    const charge = this.add.image(this.player.x, this.player.y - 36, "math-blast").setDepth(8);
    charge.setDisplaySize(profile.shotWidth * 1.15, profile.shotHeight * 1.15).setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: charge,
      alpha: 0,
      scale: 1.7 + profile.level * 0.28,
      angle: 120 + profile.level * 120,
      duration: 380 + profile.level * 120,
      ease: "Cubic.easeOut",
      onComplete: () => charge.destroy()
    });
    this.burstAt(this.player.x, this.player.y - 28, COLORS.yellow, 0.7, profile.burstParticles);
  }

  private impactBurst(x: number, y: number, profile: PowerVisualProfile) {
    const blast = this.add.image(x, y, "math-blast").setDepth(10);
    blast.setDisplaySize(profile.shotWidth, profile.shotHeight).setAlpha(1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: blast,
      alpha: 0,
      displayWidth: profile.impactWidth,
      displayHeight: profile.impactHeight,
      angle: -180 - profile.level * 120,
      duration: profile.impactDurationMs,
      ease: "Cubic.easeOut",
      onComplete: () => blast.destroy()
    });
    this.createShockwave(x, y, COLORS.yellow, profile.shockwaveRadius, profile.impactDurationMs * 0.65);
    this.createShockwave(x, y, COLORS.cyan, profile.shockwaveRadius * 1.32, profile.impactDurationMs * 0.82);
    if (profile.level === 3) {
      this.createShockwave(x, y, COLORS.pink, profile.shockwaveRadius * 1.62, profile.impactDurationMs);
    }
    this.burstAt(x, y, COLORS.pink, 0.9, profile.burstParticles);
    this.burstAt(x, y, COLORS.cyan, 0.72, Math.ceil(profile.burstParticles * 0.8));
  }

  private createPowerBeam(profile: PowerVisualProfile) {
    const height = this.player.y - this.bossSprite.y;
    const y = (this.player.y + this.bossSprite.y) / 2;
    const beams = Array.from({ length: profile.beamCount }, (_value, index) => ({
      width: Math.max(8, 34 - index * 6 + profile.level * 4),
      color: index % 3 === 0 ? COLORS.cyan : index % 3 === 1 ? COLORS.pink : 0xffffff,
      alpha: 0.34 + index * 0.1,
      scale: 1.4 + index * 0.46 + profile.level * 0.18,
      offset: (index - (profile.beamCount - 1) / 2) * (profile.level * 4)
    }));

    beams.forEach((beamSpec, index) => {
      const beam = this.add
        .rectangle(this.player.x + beamSpec.offset, y, beamSpec.width, height, beamSpec.color, beamSpec.alpha)
        .setDepth(7 + index);
      beam.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: beam,
        alpha: 0,
        scaleX: beamSpec.scale,
        duration: profile.shotDurationMs + 180,
        ease: "Cubic.easeOut",
        onComplete: () => beam.destroy()
      });
    });
  }

  private createShockwave(x: number, y: number, color: number, radius: number, duration: number) {
    const ring = this.add.circle(x, y, 18, color, 0.06).setStrokeStyle(5, color, 0.82).setDepth(10);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy()
    });
  }

  private burstAt(x: number, y: number, color: number, alpha: number, count = 14) {
    for (let index = 0; index < count; index += 1) {
      const particle = this.add.rectangle(x, y, 5, 16, color, alpha).setDepth(11);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(32, 104);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        angle: Phaser.Math.Between(-240, 240),
        duration: Phaser.Math.Between(360, 680),
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy()
      });
    }
  }

  private handlePlayerHit(projectile: Phaser.Physics.Arcade.Image, time: number) {
    projectile.destroy();
    if (time < this.invulnerableUntil || time < this.dashUntil) {
      showDamageNumber(this, this.player.x, this.player.y - 30, "หลบ!", "#43f7ff");
      return;
    }

    this.takeDamage(this.boss.id === "cyber_dragon" ? 11 : this.boss.id === "magma_ogre" ? 9 : 7);
    this.invulnerableUntil = time + 620;
  }

  private takeDamage(amount: number) {
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.damageTaken += amount;
    this.updateBars();
    showDamageNumber(this, this.player.x, this.player.y - 34, `-${amount}`, "#ff8fb3");
    this.playPlayerHurtReaction();
    this.cameras.main.shake(150, 0.006);
    if (this.playerHp <= 0) {
      this.finishBattle(false);
    }
  }

  private updateBars() {
    this.bossBar.setValue(this.bossHp, this.boss.hp);
    this.playerBar.setValue(this.playerHp, PLAYER_STATS.maxHp);
  }

  private playBossHurtReaction(profile: PowerVisualProfile) {
    const baseX = this.bossSprite.x;
    const baseScaleX = this.bossSprite.scaleX;
    const baseScaleY = this.bossSprite.scaleY;
    this.bossSprite.setTint(0xffffff);
    this.tweens.add({
      targets: this.bossSprite,
      x: {
        from: baseX - 8 - profile.level * 3,
        to: baseX + 8 + profile.level * 3
      },
      angle: { from: -4 - profile.level * 2, to: 4 + profile.level * 2 },
      scaleX: { from: baseScaleX * 1.08, to: baseScaleX * 0.94 },
      scaleY: { from: baseScaleY * 0.92, to: baseScaleY * 1.08 },
      yoyo: true,
      repeat: 2,
      duration: 70,
      onComplete: () => {
        this.bossSprite.clearTint();
        this.bossSprite.setAngle(0);
        this.bossSprite.setX(baseX);
        this.bossSprite.setScale(baseScaleX, baseScaleY);
      }
    });
  }

  private playPlayerHurtReaction() {
    const baseScaleX = this.player.scaleX;
    const baseScaleY = this.player.scaleY;
    this.player.setTint(0xff506d);
    this.tweens.add({
      targets: this.player,
      x: {
        from: this.player.x - 9,
        to: this.player.x + 9
      },
      angle: { from: -8, to: 8 },
      scaleX: { from: baseScaleX * 0.9, to: baseScaleX * 1.08 },
      scaleY: { from: baseScaleY * 1.08, to: baseScaleY * 0.9 },
      yoyo: true,
      repeat: 2,
      duration: 58,
      onComplete: () => {
        this.player.clearTint();
        this.player.setAngle(0);
        this.player.setScale(baseScaleX, baseScaleY);
      }
    });
    this.burstAt(this.player.x, this.player.y - 10, COLORS.danger, 0.76, 10);
  }

  private updateCooldownText(time: number) {
    const parts: string[] = [];
    ([1, 2, 3] as PowerLevel[]).forEach((level) => {
      const remaining = Math.max(0, this.powerReadyAt[level] - time);
      parts.push(remaining > 0 ? `L${level} ${Math.ceil(remaining / 100) / 10}s` : `L${level} พร้อม`);
    });
    const dashRemaining = Math.max(0, this.dashReadyAt - time);
    parts.push(dashRemaining > 0 ? `Dash ${Math.ceil(dashRemaining / 100) / 10}s` : "Dash พร้อม");
    this.cooldownText.setText(parts.join(" • "));
  }

  private finishBattle(won: boolean) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.closeMathModal();
    this.bossProjectiles.clear(true, true);
    this.heroProjectiles.clear(true, true);
    const attempts = this.correctAnswers + this.wrongAnswers;
    const accuracy = attempts === 0 ? 0 : this.correctAnswers / attempts;
    const hpRatio = this.playerHp / PLAYER_STATS.maxHp;
    const stars = this.calculateStars(won, hpRatio, accuracy);
    const result: BattleResult = {
      bossId: this.boss.id,
      won,
      correctAnswers: this.correctAnswers,
      wrongAnswers: this.wrongAnswers,
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken,
      remainingHp: this.playerHp,
      accuracy,
      stars
    };

    this.time.delayedCall(650, () => this.scene.start(SCENE_KEYS.result, result));
  }

  private calculateStars(won: boolean, hpRatio: number, accuracy: number): 0 | 1 | 2 | 3 {
    if (!won) return 0;
    if (hpRatio >= 0.4 && accuracy >= 0.8) return 3;
    if (hpRatio >= 0.4) return 2;
    return 1;
  }
}
