import type { PowerLevel } from "../types";

export type SingleAnswer = {
  value: number;
};

export type DivisionAnswer = {
  quotient: number;
  remainder: number;
};

export type MathAnswer = SingleAnswer | DivisionAnswer;

export type MathQuestion = {
  id: string;
  level: PowerLevel;
  prompt: string;
  kind: "single" | "divisionWithRemainder";
  answer: MathAnswer;
};

export type AnswerChoice = {
  answer: MathAnswer;
  label: string;
  correct: boolean;
};

type RandomSource = () => number;

const randInt = (min: number, max: number, random: RandomSource): number => {
  return Math.floor(random() * (max - min + 1)) + min;
};

const clampRemainder = (value: number, divisor: number): number => {
  return Math.min(value, divisor - 1);
};

const questionId = (level: PowerLevel, prompt: string): string => {
  return `${level}-${prompt.replace(/\s+/g, "-")}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const generateMathQuestion = (
  level: PowerLevel,
  random: RandomSource = Math.random
): MathQuestion => {
  if (level === 1) {
    const addition = random() < 0.5;
    const a = randInt(1, 9, random);
    const b = randInt(1, 9, random);
    const larger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const prompt = addition ? `${a} + ${b} = ?` : `${larger} - ${smaller} = ?`;
    const value = addition ? a + b : larger - smaller;
    return {
      id: questionId(level, prompt),
      level,
      prompt,
      kind: "single",
      answer: { value }
    };
  }

  if (level === 2) {
    const multiplication = random() < 0.5;
    const a = randInt(2, 12, random);
    const b = randInt(2, 12, random);
    const prompt = multiplication ? `${a} × ${b} = ?` : `${a * b} ÷ ${a} = ?`;
    const value = multiplication ? a * b : b;
    return {
      id: questionId(level, prompt),
      level,
      prompt,
      kind: "single",
      answer: { value }
    };
  }

  const operationRoll = random();
  if (operationRoll < 0.35) {
    const a = randInt(12, 99, random);
    const b = randInt(12, 99, random);
    const prompt = `${a} + ${b} = ?`;
    return {
      id: questionId(level, prompt),
      level,
      prompt,
      kind: "single",
      answer: { value: a + b }
    };
  }

  if (operationRoll < 0.7) {
    const a = randInt(20, 99, random);
    const b = randInt(5, 29, random);
    const larger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const prompt = `${larger} - ${smaller} = ?`;
    return {
      id: questionId(level, prompt),
      level,
      prompt,
      kind: "single",
      answer: { value: larger - smaller }
    };
  }

  const divisor = randInt(2, 9, random);
  const quotient = randInt(4, 14, random);
  const remainder = clampRemainder(randInt(0, divisor - 1, random), divisor);
  const dividend = divisor * quotient + remainder;
  const prompt = `${dividend} ÷ ${divisor} = ?`;

  return {
    id: questionId(level, prompt),
    level,
    prompt,
    kind: "divisionWithRemainder",
    answer: { quotient, remainder }
  };
};

export const validateAnswer = (expected: MathAnswer, submitted: MathAnswer): boolean => {
  if ("value" in expected && "value" in submitted) {
    return expected.value === submitted.value;
  }

  if ("quotient" in expected && "quotient" in submitted) {
    return expected.quotient === submitted.quotient && expected.remainder === submitted.remainder;
  }

  return false;
};

const shuffleChoices = (choices: AnswerChoice[], random: RandomSource): AnswerChoice[] => {
  const shuffled = [...choices];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const singleDistractors = (value: number, level: PowerLevel): MathAnswer[] => {
  const spread = level === 1 ? [-2, -1, 1, 2, 3, -3] : [-10, -5, -2, 2, 5, 10, 12, -12];
  return spread.map((delta) => ({ value: Math.max(0, value + delta) }));
};

const divisionDistractors = (answer: DivisionAnswer): MathAnswer[] => {
  const quotient = answer.quotient;
  const remainder = answer.remainder;
  return [
    { quotient: Math.max(0, quotient - 1), remainder },
    { quotient: quotient + 1, remainder },
    { quotient, remainder: Math.max(0, remainder - 1) },
    { quotient, remainder: remainder + 1 },
    { quotient: quotient + 1, remainder: remainder + 1 },
    { quotient: Math.max(0, quotient - 1), remainder: remainder + 1 }
  ];
};

export const generateAnswerChoices = (
  question: MathQuestion,
  random: RandomSource = Math.random
): AnswerChoice[] => {
  const answers: MathAnswer[] = [question.answer];
  const candidates =
    "value" in question.answer
      ? singleDistractors(question.answer.value, question.level)
      : divisionDistractors(question.answer);

  for (const candidate of candidates) {
    if (answers.length >= 4) break;
    const label = answerToText(candidate);
    const duplicate = answers.some((answer) => answerToText(answer) === label);
    if (!duplicate) answers.push(candidate);
  }

  return shuffleChoices(
    answers.map((answer) => ({
      answer,
      label: answerToText(answer),
      correct: validateAnswer(question.answer, answer)
    })),
    random
  );
};

export const answerToText = (answer: MathAnswer): string => {
  if ("value" in answer) {
    return `${answer.value}`;
  }

  return `${answer.quotient} เศษ ${answer.remainder}`;
};
