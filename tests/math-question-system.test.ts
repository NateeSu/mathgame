import { describe, expect, test } from "vitest";
import {
  answerToText,
  generateAnswerChoices,
  generateMathQuestion,
  validateAnswer
} from "../src/game/systems/MathQuestionSystem";

const sequence = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

describe("MathQuestionSystem", () => {
  test("level 1 creates single digit addition or subtraction with one numeric answer", () => {
    const question = generateMathQuestion(1, sequence([0.1, 0.7, 0.2]));

    expect(question.level).toBe(1);
    expect(question.kind).toBe("single");
    expect(question.prompt).toMatch(/=/);
    expect(question.answer).toEqual({ value: 9 });
  });

  test("level 2 creates multiplication table division with an exact quotient", () => {
    const question = generateMathQuestion(2, sequence([0.8, 0.4, 0.1]));

    expect(question.level).toBe(2);
    expect(question.kind).toBe("single");
    expect(question.prompt).toBe("18 ÷ 6 = ?");
    expect(question.answer).toEqual({ value: 3 });
  });

  test("level 3 can create division questions that require quotient and remainder", () => {
    const question = generateMathQuestion(3, sequence([0.95, 0.63, 0.41]));

    expect(question.level).toBe(3);
    expect(question.kind).toBe("divisionWithRemainder");
    expect(question.prompt).toBe("62 ÷ 7 = ?");
    expect(question.answer).toEqual({ quotient: 8, remainder: 6 });
  });

  test("validates numeric and division-with-remainder answers", () => {
    expect(validateAnswer({ value: 12 }, { value: 12 })).toBe(true);
    expect(validateAnswer({ value: 12 }, { value: 11 })).toBe(false);
    expect(validateAnswer({ quotient: 7, remainder: 2 }, { quotient: 7, remainder: 2 })).toBe(true);
    expect(validateAnswer({ quotient: 7, remainder: 2 }, { quotient: 7, remainder: 1 })).toBe(false);
  });

  test("creates four unique choices that include the correct answer", () => {
    const choices = generateAnswerChoices(
      {
        id: "test-question",
        level: 2,
        prompt: "6 x 7 = ?",
        kind: "single",
        answer: { value: 42 }
      },
      sequence([0.2, 0.8, 0.4, 0.6])
    );

    expect(choices).toHaveLength(4);
    expect(choices.some((choice) => choice.correct)).toBe(true);
    expect(new Set(choices.map((choice) => choice.label)).size).toBe(4);
    expect(choices.map((choice) => choice.label)).toContain(answerToText({ value: 42 }));
  });

  test("creates division choices using quotient and remainder labels", () => {
    const choices = generateAnswerChoices({
      id: "division-question",
      level: 3,
      prompt: "62 / 7 = ?",
      kind: "divisionWithRemainder",
      answer: { quotient: 8, remainder: 6 }
    });

    expect(choices).toHaveLength(4);
    expect(choices.some((choice) => choice.correct && choice.label === answerToText({ quotient: 8, remainder: 6 }))).toBe(
      true
    );
    expect(new Set(choices.map((choice) => choice.label)).size).toBe(4);
  });
});
