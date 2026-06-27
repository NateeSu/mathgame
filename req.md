# req.md — Game Requirement Spec: Math Blaster: Boss Academy

> เอกสารนี้เป็นข้อกำหนดสำหรับให้ Codex/AI coding agent อ่านแล้วสร้างเกมได้ทันที  
> เป้าหมาย: เกม 2D browser game สำหรับมือถือ เล่นได้บนเว็บ, push ขึ้น GitHub, deploy บน Vercel  
> แนวทาง asset: ใช้ **free game assets** ที่ตรวจ license แล้วเท่านั้น และต้องมี `CREDITS.md`

---

## 1. Project Summary

สร้างเกมชื่อ **Math Blaster: Boss Academy**

เป็นเกม 2D แนว boss fight สำหรับเด็กประถม เล่นบน browser โดยออกแบบให้เหมาะกับมือถือเป็นหลัก ผู้เล่นควบคุมเด็กนักรบพลังคณิต หลบพลังของบอส และกดใช้พลังโจมตี 3 ระดับ โดยแต่ละระดับต้องตอบโจทย์คณิตให้ถูกก่อนจึงจะปล่อยพลังได้

ถ้า HP ของผู้เล่นหมดก่อนจะแพ้ ถ้า HP ของบอสหมดก่อนจะชนะ

เกมต้องมีสีสันสดใส น่าตื่นตาตื่นใจ คล้าย “Game Boy รุ่นใหม่” คือมีความ retro/pixel แต่ใช้สี neon, glow, particle และ animation ที่ดูทันสมัย

---

## 2. Target Platform

### Required

- Browser game
- Mobile-first
- Responsive layout
- เล่นได้บน iOS Safari, Android Chrome, Desktop Chrome
- Deploy ได้บน Vercel แบบ static site
- Source code เก็บบน GitHub

### Recommended orientation

- Portrait-first
- Canvas scale ให้พอดีกับหน้าจอมือถือ
- มี virtual controls บนหน้าจอ ไม่ต้องพึ่ง keyboard อย่างเดียว

---

## 3. Recommended Tech Stack

ใช้ stack นี้เป็นค่าเริ่มต้น:

- **Phaser**
- **TypeScript**
- **Vite**
- **npm**
- **Vitest** สำหรับ unit test logic คณิต
- **ESLint + Prettier**
- **GitHub**
- **Vercel**

### Reasoning

- Phaser เหมาะกับเกม 2D HTML5 บน desktop และ mobile browser
- Vite build เป็น static bundle ได้ง่าย และเหมาะกับ deploy บน Vercel
- TypeScript ช่วยให้ระบบเกม เช่น player, boss, projectile, math question type ปลอดภัยขึ้น
- Vercel deploy จาก GitHub ได้ง่าย และสร้าง preview deployment ได้จาก branch/PR

---

## 4. Initial Setup Commands

Codex ควรสร้างโปรเจกต์ด้วยแนวทางนี้:

```bash
npm create vite@latest math-blaster-boss-academy -- --template vanilla-ts
cd math-blaster-boss-academy
npm install phaser
npm install -D vitest eslint prettier typescript
```

เพิ่ม scripts ใน `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 5. Game Design Pillars

เกมต้องยึด 5 หลักนี้:

1. **สนุกก่อน แต่ได้ฝึกคณิตจริง**
   - เด็กต้องรู้สึกว่าเล่นเกมต่อสู้ ไม่ใช่ทำแบบฝึกหัดเฉย ๆ

2. **โจทย์ต้องสั้นและชัด**
   - ตัวเลขใหญ่
   - ปุ่มตอบใหญ่
   - มี feedback ทันที

3. **ความยากเพิ่มแบบนุ่มนวล**
   - บอสตัวแรกง่าย
   - บอสตัวที่สองเริ่มใช้สูตรคูณ
   - บอสตัวที่สามใช้โจทย์ซับซ้อนขึ้น

4. **แพ้ได้ แต่ไม่ทำให้เด็กท้อ**
   - ตอบผิดไม่ควรเสีย HP เยอะ
   - ควรลงโทษด้วย cooldown หรือเสีย combo มากกว่า

5. **ภาพต้องสดใส**
   - ใช้สี neon fantasy
   - มี particle, hit effect, damage numbers, screen shake เบา ๆ

---

## 6. Core Gameplay Loop

1. แสดงฉากต่อสู้
2. ผู้เล่นหลบกระสุน/พลังของบอส
3. ผู้เล่นกดปุ่มพลัง Level 1, Level 2 หรือ Level 3
4. เกมเปิด math modal
5. ผู้เล่นตอบโจทย์
6. ถ้าตอบถูก:
   - ปิด modal
   - ยิงพลังไปที่บอส
   - ลด HP บอสตาม damage ของพลัง
   - แสดง damage number
   - เพิ่ม combo
7. ถ้าตอบผิด:
   - แสดง feedback “ลองอีกครั้ง!”
   - ยกเลิกพลัง
   - reset combo
   - เพิ่ม cooldown หรือเสีย HP เล็กน้อย
8. ถ้า HP บอสหมด แสดง Victory
9. ถ้า HP ผู้เล่นหมด แสดง Defeat

---

## 7. Game Controls

### Mobile controls

ด้านล่างหน้าจอควรมี:

- ปุ่มซ้าย `◀`
- ปุ่มขวา `▶`
- ปุ่ม dash `⚡`
- ปุ่มพลัง 3 ระดับ:
  - `L1`
  - `L2`
  - `L3`

### Desktop fallback

รองรับ keyboard ด้วย:

| Action | Key |
|---|---|
| Move left | ArrowLeft / A |
| Move right | ArrowRight / D |
| Dash | Space |
| Power Level 1 | 1 |
| Power Level 2 | 2 |
| Power Level 3 | 3 |
| Submit answer | Enter |
| Close modal / back | Esc |

---

## 8. Screen Layout

ใช้ portrait layout เป็นหลัก:

```text
┌────────────────────────────┐
│ Boss: Slime King           │
│ Boss HP █████████░░░       │
│ Player HP ███████░░░       │
├────────────────────────────┤
│                            │
│          BOSS              │
│       bullets/effects      │
│                            │
│                            │
│         PLAYER             │
│                            │
├────────────────────────────┤
│  ◀   ▶   DASH    L1 L2 L3  │
└────────────────────────────┘
```

### Math modal layout

```text
┌────────────────────────────┐
│ เลือกคำตอบให้ถูกต้อง       │
│                            │
│          47 + 38 = ?       │
│                            │
│        [ input ]           │
│                            │
│  1 2 3                     │
│  4 5 6                     │
│  7 8 9                     │
│  ลบ 0 ตกลง                │
└────────────────────────────┘
```

สำหรับหารมีเศษ:

```text
74 ÷ 6 = ?
ผลหาร: [ 12 ]
เศษ:    [ 2  ]
```

---

## 9. Player

### Concept

ผู้เล่นเป็นเด็กนักรบพลังคณิต

ชื่อ default:

- Thai: `นักรบคณิต`
- English internal id: `MathHero`

### Stats

```ts
type PlayerStats = {
  maxHp: number;
  hp: number;
  moveSpeed: number;
  dashSpeed: number;
  dashDurationMs: number;
  dashCooldownMs: number;
};
```

Default values:

```ts
const PLAYER_STATS = {
  maxHp: 100,
  hp: 100,
  moveSpeed: 220,
  dashSpeed: 460,
  dashDurationMs: 180,
  dashCooldownMs: 900
};
```

### Required states

- idle
- run
- dash
- hurt
- attack
- defeated

### Implementation note

ถ้ายังไม่มี sprite animation จริง ให้ใช้ placeholder sprite แบบ pixel style ได้ก่อน เช่น rectangle/circle sprite ที่วาดด้วย Phaser Graphics แต่โค้ดต้องเตรียม path asset จริงไว้เพื่อแทนทีหลัง

---

## 10. Bosses

เกมต้องมีบอส 3 ตัว

### Boss 1: Slime King

เหมาะกับด่านแรก

```ts
const SLIME_KING = {
  id: "slime_king",
  displayName: "Slime King",
  hp: 120,
  theme: "green neon slime",
  preferredPowerLevel: 1
};
```

#### Visual

- เมือกสีเขียว
- มงกุฎสีทอง
- เด้งไปมา
- กระสุนเป็นก้อนเมือก

#### Attack patterns

1. `single_slime_shot`
   - ยิงกระสุนเมือกตรงลงมาช้า ๆ
2. `triple_slime_spread`
   - ยิง 3 ลูกกระจาย
3. `slime_wave`
   - เมื่อ HP ต่ำกว่า 50% ให้ยิงเป็น wave ช้า ๆ

#### Educational focus

- Level 1
- บวก/ลบเลข 1 หลัก

---

### Boss 2: Magma Ogre

เหมาะกับด่านกลาง

```ts
const MAGMA_OGRE = {
  id: "magma_ogre",
  displayName: "Magma Ogre",
  hp: 180,
  theme: "orange red lava",
  preferredPowerLevel: 2
};
```

#### Visual

- ยักษ์หินลาวา
- ตัวสีส้มแดง
- มีรอยแตกเรืองแสง
- กระสุนเป็นลูกไฟ

#### Attack patterns

1. `fireball_arc`
   - ยิงลูกไฟเป็นโค้ง
2. `lava_column`
   - สุ่มตำแหน่งพื้น แล้วมีเสาไฟพุ่งขึ้น
3. `magma_rain`
   - เมื่อ HP ต่ำกว่า 40% ให้มีลูกไฟตกหลายลูก

#### Educational focus

- Level 2
- สูตรคูณ
- หารลงตัว

---

### Boss 3: Cyber Dragon

บอสสุดท้าย

```ts
const CYBER_DRAGON = {
  id: "cyber_dragon",
  displayName: "Cyber Dragon",
  hp: 260,
  theme: "purple blue cyber neon",
  preferredPowerLevel: 3
};
```

#### Visual

- มังกรไซเบอร์
- สีม่วง/ฟ้า neon
- มีปีกและหางแบบ pixel sci-fi
- กระสุนเป็น laser orb / plasma

#### Attack patterns

1. `laser_warning_line`
   - แสดงเส้นเตือนก่อนยิง laser
2. `orb_circle`
   - ยิงกระสุนเป็นวงกระจาย
3. `shield_phase`
   - เมื่อ HP ต่ำกว่า 60% เข้าสู่ shield phase
   - ใน shield phase พลัง L1/L2 ทำ damage ลดลง
   - L3 ทำ damage เต็ม และควรใช้ทำลาย shield

#### Educational focus

- Level 3
- บวก/ลบ 2 หลักแบบมีทด/ยืม
- คูณ 2 หลักกับ 1 หลัก
- หาร 2 หลักกับ 1 หลักแบบมีเศษ

---

## 11. Math Power System

ผู้เล่นมีพลัง 3 ระดับ

```ts
type PowerLevel = 1 | 2 | 3;

type DamageConfig = {
  level: PowerLevel;
  baseDamage: number;
  cooldownMs: number;
  timeLimitMs: number;
};

const DAMAGE_CONFIG: Record<PowerLevel, DamageConfig> = {
  1: { level: 1, baseDamage: 10, cooldownMs: 1200, timeLimitMs: 8000 },
  2: { level: 2, baseDamage: 25, cooldownMs: 2200, timeLimitMs: 10000 },
  3: { level: 3, baseDamage: 55, cooldownMs: 4200, timeLimitMs: 15000 }
};
```

### Level 1: Quick Spark

#### Requirement

เมื่อกดปล่อยพลัง Level 1 ต้องตอบโจทย์บวกหรือลบเลข 1 หลักให้ถูกก่อน

#### Allowed question types

- `a + b`
- `a - b`

#### Constraints

- `a` และ `b` เป็นเลข 0–9
- สำหรับ MVP ให้ผลลัพธ์ไม่ติดลบ
- ถ้าเป็นลบ ให้ swap ค่าเพื่อให้ `a >= b`

#### Examples

- `7 + 2 = ?`
- `9 - 4 = ?`
- `3 + 6 = ?`

#### Damage

- base damage: 10
- combo bonus ใช้ multiplier ได้

---

### Level 2: Times Bolt

#### Requirement

เมื่อกด Level 2 ต้องตอบโจทย์คูณ หรือหารลงตัวที่อยู่ในสูตรคูณ

#### Allowed question types

- `a × b`
- `product ÷ a`

#### Constraints

- `a` และ `b` อยู่ใน 2–12
- division ต้องลงตัวเสมอ
- product ต้องมาจาก `a * b`

#### Examples

- `6 × 8 = ?`
- `56 ÷ 7 = ?`
- `9 × 4 = ?`
- `72 ÷ 8 = ?`

#### Damage

- base damage: 25

---

### Level 3: Mega Beam

#### Requirement

Level 3 เป็นดาเมจสูงสุด ต้องตอบโจทย์ยากกว่า

#### Allowed question types

1. บวกเลข 2 หลักแบบมีทด
2. ลบเลข 2 หลักแบบมีการยืม
3. คูณเลข 2 หลักกับเลข 1 หลัก
4. หารเลข 2 หลักกับเลข 1 หลักแบบมีเศษ

#### Constraints

##### Addition with carry

- `a` และ `b` เป็น 2 หลัก: 10–99
- ต้องมีการทดอย่างน้อย 1 หลัก
- ตัวอย่าง: `47 + 38 = ?`

##### Subtraction with borrowing

- `a` และ `b` เป็น 2 หลัก
- `a > b`
- ต้องมีการยืมหลักหน่วย
- ตัวอย่าง: `82 - 49 = ?`

##### Multiplication

- `a` เป็น 2 หลัก: 10–99
- `b` เป็น 1 หลัก: 2–9
- ตัวอย่าง: `23 × 6 = ?`

##### Division with remainder

- dividend เป็น 2 หลัก: 10–99
- divisor เป็น 1 หลัก: 2–9
- ต้องมีเศษมากกว่า 0
- answer เป็น object:
  - quotient
  - remainder

ตัวอย่าง:

```text
74 ÷ 6 = ?
ผลหาร = 12
เศษ = 2
```

#### Damage

- base damage: 55

---

## 12. Math Question Types

สร้างระบบคำถามแบบ typed

```ts
export type PowerLevel = 1 | 2 | 3;

export type SimpleAnswer = {
  kind: "single";
  value: number;
};

export type DivisionRemainderAnswer = {
  kind: "division-remainder";
  quotient: number;
  remainder: number;
};

export type MathAnswer = SimpleAnswer | DivisionRemainderAnswer;

export type MathQuestion = {
  id: string;
  level: PowerLevel;
  prompt: string;
  answer: MathAnswer;
  timeLimitMs: number;
  damage: number;
  explanation?: string;
};
```

---

## 13. MathQuestionSystem Requirements

สร้างไฟล์:

```text
src/game/systems/MathQuestionSystem.ts
```

ต้อง export functions:

```ts
export function generateQuestion(level: PowerLevel): MathQuestion;
export function validateAnswer(question: MathQuestion, userInput: unknown): boolean;
export function generateLevel1Question(): MathQuestion;
export function generateLevel2Question(): MathQuestion;
export function generateLevel3Question(): MathQuestion;
```

### Unit tests required

สร้างไฟล์:

```text
tests/math-question-system.test.ts
```

ต้องทดสอบอย่างน้อย:

- Level 1 generates only one-digit addition/subtraction
- Level 1 subtraction result is not negative
- Level 2 multiplication uses factors 2–12
- Level 2 division is always exact
- Level 3 addition has carry
- Level 3 subtraction has borrowing
- Level 3 division has remainder > 0
- validateAnswer works for normal answer
- validateAnswer works for quotient/remainder answer

---

## 14. Combat System

### HP

```ts
type Combatant = {
  maxHp: number;
  hp: number;
};
```

### Damage rules

- Player starts with 100 HP
- Boss HP:
  - Slime King: 120
  - Magma Ogre: 180
  - Cyber Dragon: 260
- Boss projectile damage:
  - small bullet: 5
  - medium bullet: 8
  - heavy attack: 12
- Wrong answer:
  - MVP default: no HP loss
  - reset combo
  - power cooldown +1000ms
- Optional mode:
  - wrong answer causes player -3 HP

### Combo

```ts
type ComboState = {
  count: number;
  multiplier: number;
};
```

Rules:

- Each correct answer increases combo count by 1
- Every 3 correct answers gives multiplier:
  - 0–2 correct: x1.0
  - 3–5 correct: x1.2
  - 6–8 correct: x1.35
  - 9+ correct: x1.5
- Wrong answer resets combo to 0

Damage formula:

```ts
finalDamage = Math.round(baseDamage * comboMultiplier * bossWeaknessMultiplier)
```

Boss weakness multiplier:

- If using boss preferred power level:
  - damage x1.15
- During Cyber Dragon shield:
  - L1 damage x0.25
  - L2 damage x0.5
  - L3 damage x1.0

---

## 15. Boss AI & Projectile System

สร้าง projectile แบบง่ายก่อน

```ts
type ProjectileConfig = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  textureKey: string;
};
```

### Projectile requirements

- บอสยิง projectile ตาม interval
- projectile ชน player แล้วลด HP
- projectile ออกจาก screen แล้ว destroy
- player dash ควรมี invulnerability ชั่วคราวระหว่าง dash
- มี hit flash เมื่อ player โดน

### Boss attack timing

#### Slime King

- ยิงทุก 1500ms
- HP < 50% ยิงทุก 1100ms

#### Magma Ogre

- ยิงทุก 1200ms
- มี lava column ทุก 4500ms
- HP < 40% ยิงเร็วขึ้นเป็น 900ms

#### Cyber Dragon

- ยิงทุก 900ms
- laser warning ทุก 5000ms
- shield phase เมื่อ HP < 60%
- HP < 30% ยิงเร็วขึ้นเป็น 700ms

---

## 16. Scenes

สร้าง scene เหล่านี้:

```text
src/game/scenes/BootScene.ts
src/game/scenes/PreloadScene.ts
src/game/scenes/MenuScene.ts
src/game/scenes/TutorialScene.ts
src/game/scenes/BossSelectScene.ts
src/game/scenes/BattleScene.ts
src/game/scenes/ResultScene.ts
```

### BootScene

- ตั้งค่า global game size
- ตั้งค่า scale mode
- ไป PreloadScene

### PreloadScene

- โหลด assets
- ถ้ายังไม่มี asset จริง ให้ใช้ fallback generated texture
- ไป MenuScene

### MenuScene

- title: Math Blaster: Boss Academy
- ต้องแสดงข้อความเครดิตนี้บนหน้าเมนูหลักอย่างชัดเจน แต่ไม่รบกวนการเริ่มเล่น:

```text
สร้างแอพโดยพ่อน๊อต
```

- รูปแบบเครดิตในเมนูหลัก:
  - วางเป็นข้อความเล็ก-กลางใต้ชื่อเกม หรือบริเวณด้านล่างของเมนู
  - ใช้สีสันสดใส เช่น neon glow, rainbow gradient, sparkle หรือ pixel highlight
  - ต้องอ่านง่ายบนมือถือ
  - ห้ามทำเป็น splash screen, interstitial screen หรือฉากโฆษณาก่อนเข้าเกม
  - ต้องไม่หน่วงเวลา ไม่บังคับรอ และไม่ขัดจังหวะผู้เล่น
  - เครดิตต้องปรากฏในเมนูหลักทุกครั้งที่ผู้เล่นกลับมาหน้าเมนู
- ปุ่ม:
  - Start
  - Tutorial
  - Boss Select
- พื้นหลังสีสดใส มี animation เล็กน้อย

### TutorialScene

อธิบายสั้น ๆ:

- หลบพลังบอส
- กด L1/L2/L3 เพื่อโจมตี
- ตอบโจทย์ให้ถูก
- HP ใครหมดก่อนแพ้

### BossSelectScene

แสดงบอส 3 ตัว:

- Slime King
- Magma Ogre
- Cyber Dragon

ให้เลือกด่านได้โดยตรงใน MVP

### BattleScene

รับ boss id จาก BossSelectScene

ต้องมี:

- player
- boss
- projectiles
- HP bars
- mobile controls
- math modal
- win/lose detection

### ResultScene

แสดง:

- Victory / Defeat
- boss defeated หรือ player defeated
- correct answers
- wrong answers
- accuracy %
- stars 1–3
- ปุ่ม Retry
- ปุ่ม Boss Select

---

## 17. UI Requirements

### HealthBar

สร้าง component:

```text
src/game/ui/HealthBar.ts
```

Features:

- แสดง label
- แสดง current HP / max HP
- bar ลดลง smoothly
- สีสดใส
- boss bar ใหญ่กว่า player bar

### MobileControls

สร้าง component:

```text
src/game/ui/MobileControls.ts
```

Features:

- ปุ่ม virtual controls
- รองรับ pointer/touch
- ปุ่มใหญ่พอสำหรับเด็ก
- มี visual feedback ตอนกด

### MathModal

สร้าง component:

```text
src/game/ui/MathModal.ts
```

Features:

- แสดง prompt
- แสดง timer bar
- keypad ตัวเลข
- ปุ่ม delete
- ปุ่ม submit
- แสดง feedback ถูก/ผิด
- รองรับ division remainder answer
- ระหว่าง modal เปิด ให้ game slow motion หรือ pause projectile spawning

MVP rule:

- ระหว่างเปิด modal ให้ boss projectiles ที่มีอยู่เคลื่อนที่ช้าลง 70%
- ไม่สร้าง projectile ใหม่จน modal ปิด

---

## 18. Visual Style Guide

### Theme

- Modern Game Boy
- Pixel art
- Neon fantasy
- สีสด น่าตื่นเต้น
- เหมาะกับเด็กประถม

### Palette suggestion

```text
Background: #111827, #1e1b4b, #312e81
Player energy: #38bdf8, #fde047, #f472b6
Level 1: yellow/cyan
Level 2: orange/red
Level 3: purple/rainbow/neon
Slime boss: green/lime
Magma boss: orange/red
Cyber boss: purple/blue
UI frame: dark navy + bright outline
```

### Effects required

- Damage number pop
- Hit flash
- Small screen shake
- Projectile trails
- Power beam effect
- Victory burst particle
- Correct answer sparkle

---

## 19. Asset Policy

ผู้ใช้เลือกแนวทาง **หา asset ฟรี**

### Required

ใช้เฉพาะ asset ที่เป็น:

- CC0
- Public Domain
- หรือ license ที่อนุญาตให้ใช้ในเกมฟรี/เชิงพาณิชย์ได้

### Sources allowed

ใช้แหล่งเหล่านี้ได้:

1. Kenney
   - https://kenney.nl/assets
2. OpenGameArt
   - https://opengameart.org
3. itch.io free game assets
   - https://itch.io/game-assets/free
   - ควรเลือก asset ที่ระบุ license ชัดเจน เช่น CC0 หรือ CC-BY

### Important license rules

- ห้ามใช้ asset ที่ไม่ระบุ license
- ห้ามใช้ asset ที่ห้าม commercial use ถ้าไม่แน่ใจ
- ห้ามใช้ fan art, Pokémon-like copyrighted characters, Mario-like assets, Game Boy trademarked UI ที่คัดลอกตรง ๆ
- ถ้าใช้ CC-BY ต้องใส่ credit ใน `CREDITS.md`
- ถ้าใช้ CC-BY-SA ให้หลีกเลี่ยงสำหรับ MVP เพื่อไม่ให้ license ซับซ้อน
- ถ้าไม่แน่ใจ ให้ใช้ placeholder generated art แทนก่อน

### Required files

สร้างไฟล์:

```text
CREDITS.md
```

Format:

```md
# Credits

## Sprites

| Asset | Author | Source URL | License | Notes |
|---|---|---|---|---|
| Example Player Sprite | Author Name | https://... | CC0 | Used for player placeholder |

## Audio

| Asset | Author | Source URL | License | Notes |
|---|---|---|---|---|
```

### Recommended free asset mapping

Codex ควรพยายามหา asset ที่ใกล้เคียง:

| Game asset | Search keywords |
|---|---|
| Player child hero | `free pixel hero character CC0` |
| Slime King | `free pixel slime boss CC0` |
| Magma Ogre | `free pixel ogre boss lava CC0` |
| Cyber Dragon | `free pixel dragon boss CC0` |
| Projectiles | `free pixel projectile magic orb CC0` |
| UI buttons | `Kenney UI pack CC0` |
| Sound effects | `Kenney audio CC0`, `Bfxr generated sounds` |

### Fallback requirement

ถ้า Codex ไม่สามารถดาวน์โหลดหรือยืนยัน license ของ asset ได้:

- สร้าง placeholder art ด้วย Phaser Graphics
- placeholder ต้องมีสีสันสวยงาม
- เกมต้องรันได้ทันทีโดยไม่ต้องพึ่ง asset ภายนอก
- คง folder structure สำหรับแทน asset จริงภายหลัง

---

## 20. Asset Folder Structure

```text
public/assets/
├─ sprites/
│  ├─ player/
│  │  ├─ student_idle.png
│  │  ├─ student_run.png
│  │  ├─ student_dash.png
│  │  └─ student_hurt.png
│  ├─ bosses/
│  │  ├─ slime_king.png
│  │  ├─ magma_ogre.png
│  │  └─ cyber_dragon.png
│  ├─ projectiles/
│  │  ├─ slime_bullet.png
│  │  ├─ fireball.png
│  │  └─ laser_orb.png
│  └─ effects/
│     ├─ power_l1.png
│     ├─ power_l2.png
│     └─ power_l3.png
├─ audio/
│  ├─ correct.wav
│  ├─ wrong.wav
│  ├─ hit.wav
│  ├─ power_l1.wav
│  ├─ power_l2.wav
│  ├─ power_l3.wav
│  └─ victory.wav
└─ ui/
   ├─ button.png
   ├─ hp_bar.png
   └─ panel.png
```

---

## 21. Recommended Repository Structure

```text
math-blaster-boss-academy/
├─ public/
│  └─ assets/
├─ src/
│  ├─ main.ts
│  ├─ style.css
│  ├─ game/
│  │  ├─ config.ts
│  │  ├─ constants.ts
│  │  ├─ types.ts
│  │  ├─ scenes/
│  │  │  ├─ BootScene.ts
│  │  │  ├─ PreloadScene.ts
│  │  │  ├─ MenuScene.ts
│  │  │  ├─ TutorialScene.ts
│  │  │  ├─ BossSelectScene.ts
│  │  │  ├─ BattleScene.ts
│  │  │  └─ ResultScene.ts
│  │  ├─ entities/
│  │  │  ├─ Player.ts
│  │  │  ├─ Boss.ts
│  │  │  └─ Projectile.ts
│  │  ├─ systems/
│  │  │  ├─ MathQuestionSystem.ts
│  │  │  ├─ DamageSystem.ts
│  │  │  ├─ BossPatternSystem.ts
│  │  │  └─ DifficultySystem.ts
│  │  └─ ui/
│  │     ├─ HealthBar.ts
│  │     ├─ MobileControls.ts
│  │     ├─ MathModal.ts
│  │     └─ DamageNumber.ts
├─ tests/
│  └─ math-question-system.test.ts
├─ CREDITS.md
├─ README.md
├─ req.md
├─ package.json
├─ vite.config.ts
└─ tsconfig.json
```

---

## 22. Implementation Details

### `src/main.ts`

- import Phaser
- import scenes
- create Phaser.Game
- mount into `#app`

### `src/game/config.ts`

กำหนด game config:

```ts
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;
```

ใช้ scale:

```ts
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### `src/game/constants.ts`

เก็บ:

- damage config
- boss config
- player stats
- colors
- scene keys

---

## 23. Accessibility & Child-Friendly Requirements

- ตัวเลขต้องใหญ่
- font อ่านง่าย
- ปุ่มกดต้องใหญ่
- หลีกเลี่ยง text ยาวระหว่างต่อสู้
- สีไม่ควรแสบตาเกินไป
- ไม่ควรมีภาพน่ากลัวเกินเด็ก
- บอสควรดูเป็นการ์ตูน ไม่ใช่ horror
- ไม่มีระบบเงินจริง
- ไม่มี ads
- ไม่มี account/login
- ไม่มี chat
- ไม่มี external tracking สำหรับ MVP

---

## 24. Language

เกมควรใช้ภาษาไทยเป็นหลัก แต่ code ใช้ English identifiers

UI text examples:

```text
เริ่มเกม
เลือกบอส
วิธีเล่น
พลังระดับ 1
พลังระดับ 2
พลังระดับ 3
ถูกต้อง!
ลองอีกครั้ง!
ชนะแล้ว!
แพ้แล้ว ลองใหม่อีกครั้ง
ความแม่นยำ
```

Internal identifiers:

```ts
"start_game"
"boss_select"
"correct"
"wrong"
"victory"
"defeat"
```

---

## 25. Result & Scoring

หลังจบด่านให้แสดง:

```ts
type BattleResult = {
  bossId: string;
  won: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  damageDealt: number;
  damageTaken: number;
  remainingHp: number;
  accuracy: number;
  stars: 1 | 2 | 3;
};
```

### Star rules

- 1 star: ชนะ
- 2 stars: ชนะและ HP เหลือ >= 40%
- 3 stars: ชนะ, HP เหลือ >= 40%, accuracy >= 80%

ถ้าแพ้:

- 0 stars หรือไม่แสดงดาว
- แสดงคำแนะนำสั้น ๆ เช่น:
  - “ลองใช้ Dash หลบกระสุน”
  - “ใช้ L1 เมื่ออยากโจมตีเร็ว”
  - “ใช้ L3 ตอนบอสเปิดเกราะ”

---

## 26. MVP Acceptance Criteria

Codex ต้องทำให้ผ่าน criteria เหล่านี้ก่อนถือว่าเสร็จ:

### Game launch

- `npm install` สำเร็จ
- `npm run dev` เปิดเกมได้
- `npm run build` สำเร็จ
- `npm run test` สำเร็จ
- หน้าเมนูหลักต้องแสดงข้อความเครดิต `สร้างแอพโดยพ่อน๊อต` อย่างชัดเจน
- เครดิตในเมนูหลักต้องมีสีสันสดใส อ่านง่ายบนมือถือ และไม่เป็น splash/interstitial screen ที่ขัดจังหวะผู้เล่น

### Gameplay

- เข้าเกมได้จาก Menu
- เลือกบอส 3 ตัวได้
- เข้า BattleScene ได้
- ผู้เล่นขยับซ้าย/ขวาได้
- ผู้เล่น dash ได้
- บอสยิง projectile ได้
- projectile ชนผู้เล่นแล้วลด HP
- ปุ่ม L1/L2/L3 เปิดโจทย์ได้
- ตอบถูกแล้วโจมตีบอสได้
- HP บอสลดจริง
- ตอบผิดแล้วไม่โจมตี
- HP ใครหมดก่อน แสดงผลชนะ/แพ้

### Math

- Level 1 เป็นบวก/ลบเลข 1 หลัก
- Level 2 เป็นคูณ/หารลงตัวในสูตรคูณ
- Level 3 มีโจทย์ยากตามที่กำหนด
- หารมีเศษต้องตอบผลหารและเศษได้
- มี unit tests สำหรับ generator

### UI

- เล่นบนมือถือได้
- ปุ่มใหญ่พอ
- HP bar ชัดเจน
- Modal คณิตชัดเจน
- มี feedback ถูก/ผิด
- ภาพมีสีสันสดใส

### Deployment

- build output อยู่ที่ `dist`
- Vercel ตั้งค่า build command: `npm run build`
- Vercel output directory: `dist`

---

## 27. Stretch Goals หลัง MVP

ทำหลังจากเกมเล่นได้แล้วเท่านั้น:

1. เพิ่ม animation sprite จริง
2. เพิ่มเสียงเพลง chip-tune
3. เพิ่ม save progress ใน localStorage
4. เพิ่ม adaptive difficulty
5. เพิ่มระบบ achievements
6. เพิ่ม “โหมดฝึกโจทย์” ไม่ต้องสู้บอส
7. เพิ่ม settings:
   - ปิดเสียง
   - ลด effect
   - เปิด/ปิด penalty จากตอบผิด
8. เพิ่ม PWA installable
9. เพิ่ม localization English/Thai
10. เพิ่ม cloud leaderboard ภายหลังเท่านั้น

---

## 28. Coding Guidelines

- ใช้ TypeScript strict mode
- แยก logic เกมกับ UI ให้ชัด
- MathQuestionSystem ต้องไม่ผูกกับ Phaser เพื่อ test ง่าย
- หลีกเลี่ยง magic numbers ให้เก็บใน constants
- ห้าม hardcode asset external URL ใน runtime
- ถ้า asset หาย เกมต้อง fallback เป็น generated texture
- อย่าใช้ backend สำหรับ MVP
- อย่าเพิ่มระบบ login
- อย่าเพิ่ม database

---

## 29. Suggested Development Phases for Codex

### Phase 1: Project foundation

- สร้าง Vite + TypeScript project
- ติดตั้ง Phaser
- สร้าง scene skeleton
- สร้าง config
- ทำ build/test ให้ผ่าน

### Phase 2: Playable battle

- สร้าง player
- สร้าง boss
- สร้าง projectile
- HP system
- collision
- win/lose

### Phase 3: Math power

- MathQuestionSystem
- MathModal
- L1/L2/L3
- validate answer
- damage system
- unit tests

### Phase 4: Boss variety

- Slime King patterns
- Magma Ogre patterns
- Cyber Dragon patterns
- shield phase

### Phase 5: Visual polish

- particles
- damage numbers
- screen shake
- neon UI
- placeholder art polish
- optional free assets integration

### Phase 6: Docs & deploy

- README.md
- CREDITS.md
- Vercel instructions
- final test build

---

## 30. README Requirements

สร้าง `README.md` ที่มี:

```md
# Math Blaster: Boss Academy

## What is this?

2D mobile browser educational math boss fight game for primary school children.

## Tech stack

- Phaser
- TypeScript
- Vite
- Vercel

## Development

npm install
npm run dev

## Build

npm run build

## Test

npm run test

## Deploy on Vercel

Build command: npm run build
Output directory: dist

## Asset credits

See CREDITS.md
```

---

## 31. Important Notes for Codex

- ทำเกมให้เล่นได้ก่อน แม้ยังไม่มี asset จริง
- ถ้าใช้ asset ฟรี ต้องใส่ credit
- ห้ามใช้ asset ที่ license ไม่ชัดเจน
- ห้ามหยุดที่หน้า UI mockup ต้องมี gameplay จริง
- ให้ `npm run build` ผ่านเสมอ
- ให้ `npm run test` ผ่านเสมอ
- เกมต้องเหมาะกับเด็กประถม
- เน้นสีสันสดใสและ feedback สนุก
- อย่า over-engineer backend หรือ auth
- MVP ต้องเป็น static frontend เท่านั้น

---

## 32. Definition of Done

ถือว่าโปรเจกต์เสร็จ MVP เมื่อ:

- เปิดเกมใน browser ได้
- หน้าเมนูหลักแสดงข้อความ `สร้างแอพโดยพ่อน๊อต` แบบสีสันสดใส โดยไม่ทำเป็นฉากโฆษณาหรือ splash screen
- เล่นบนมือถือได้
- เลือกบอสได้ครบ 3 ตัว
- ต่อสู้กับบอสได้จริง
- มีระบบ HP
- หลบกระสุนได้
- ใช้พลัง 3 ระดับได้
- ตอบโจทย์คณิตก่อนโจมตีได้
- คณิตตรงตาม requirement
- มี win/lose screen
- มี Result stats
- build ผ่าน
- test ผ่าน
- deploy บน Vercel ได้
- มี `CREDITS.md`
- มี `README.md`
- มี `req.md` นี้ใน repository
