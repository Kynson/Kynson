type Value = string | number | boolean | null | undefined;

type JSONValue = Value | { [key: string]: JSONValue } | JSONValue[];
type IntermediateValue = JSONValue[] | Record<string, JSONValue>;

export class ExpressionInterpreter {
  public static readonly EXPRESSION_REGEX = /(?<=\{)[0-9A-Za-z_[\].]+(?=\})/gmu;
  public static readonly IDENTIFIER_REGEX = /[A-Za-z0-9_]/u;
  public static readonly MEMBER_ACCESS_OPERATOR = '.';
  public static readonly ARRARY_SUBSCRIPT_OPEN = '[';
  public static readonly ARRARY_SUBSCRIPT_CLOSE = ']';

  private currentIdentifier = '';
  private currentSubscript = '';

  private parsingMode: 'identifier' | 'subscript' = 'identifier';

  private readonly data: IntermediateValue;
  private intermediateValue: IntermediateValue;

  private index = 0;

  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types This constructor is too simple for this rule and making it readonly breaks the implmentation
  public constructor(data: IntermediateValue) {
    this.data = data;
    this.intermediateValue = data;
  }

  private static isValue(expression: unknown): expression is Value {
    return (
      typeof expression === 'string' ||
      typeof expression === 'number' ||
      expression === null ||
      // oxlint-disable-next-line no-undefined This is intentional as we need to check for undefined
      expression === undefined
    );
  }

  private tryMemberAccess(char?: string): {
    shouldContinue: boolean;
    value: Value | null;
  } {
    if (Array.isArray(this.intermediateValue)) {
      throw new TypeError(
        `Invalid intermediate value for member access on array: ${JSON.stringify(this.intermediateValue)}`
      );
    }

    if (this.currentIdentifier === '') {
      throw new TypeError('Tried to access a member on an object, but no identifier was provided.');
    }

    const newTarget = this.intermediateValue[this.currentIdentifier];

    if (ExpressionInterpreter.isValue(newTarget)) {
      return { shouldContinue: false, value: newTarget };
    }

    this.intermediateValue = newTarget;

    this.currentIdentifier = '';

    this.parsingMode =
      char === ExpressionInterpreter.MEMBER_ACCESS_OPERATOR ? 'identifier' : 'subscript';

    return { shouldContinue: true, value: null };
  }

  private tryArraySubscript(nextChar?: string): {
    shouldContinue: boolean;
    value: Value | null;
  } {
    if (!Array.isArray(this.intermediateValue)) {
      throw new TypeError(
        `Invalid intermediate value for array subscript access on non-array: ${JSON.stringify(this.intermediateValue)}`
      );
    }

    if (this.currentSubscript === '') {
      throw new Error(`Tried to access an array subscript, but no index was provided.`);
    }

    const arrayIndex = Math.trunc(Number(this.currentSubscript));
    const newTarget = this.intermediateValue[arrayIndex];

    if (ExpressionInterpreter.isValue(newTarget)) {
      return { shouldContinue: false, value: newTarget };
    }

    this.intermediateValue = newTarget;

    this.parsingMode =
      nextChar === ExpressionInterpreter.ARRARY_SUBSCRIPT_OPEN ? 'subscript' : 'identifier';
    this.currentSubscript = '';

    if (
      nextChar === ExpressionInterpreter.MEMBER_ACCESS_OPERATOR ||
      nextChar === ExpressionInterpreter.ARRARY_SUBSCRIPT_OPEN
    ) {
      this.index++;
    }

    return { shouldContinue: true, value: null };
  }

  private tryFinalizeEvaluation(expression: string): Value {
    if (
      expression[this.index - 1] === ExpressionInterpreter.ARRARY_SUBSCRIPT_OPEN ||
      expression[this.index - 1] === ExpressionInterpreter.MEMBER_ACCESS_OPERATOR
    ) {
      throw new Error(`Unexpected end of expression: ${expression}`);
    }

    if (Array.isArray(this.intermediateValue)) {
      throw new TypeError(
        `Expected a value of type string, number, boolean, null, or undefined, but got: ${JSON.stringify(this.intermediateValue)}`
      );
    }

    // Handling the case where the expression ends with a pure identifier like foo.bar
    const { value } = this.tryMemberAccess();

    if (ExpressionInterpreter.isValue(value)) {
      return value;
    }

    throw new Error(
      `Expected a value of type string, number, boolean, null, or undefined, but got: ${JSON.stringify(value)}`
    );
  }

  private walkExpression(expression: string): Value {
    while (this.index < expression.length) {
      const char = expression[this.index];

      this.index++;

      if (this.parsingMode === 'identifier' && char.match(ExpressionInterpreter.IDENTIFIER_REGEX)) {
        this.currentIdentifier += char;

        continue;
      }

      if (
        this.parsingMode === 'identifier' &&
        (char === ExpressionInterpreter.MEMBER_ACCESS_OPERATOR ||
          char === ExpressionInterpreter.ARRARY_SUBSCRIPT_OPEN)
      ) {
        const { shouldContinue, value } = this.tryMemberAccess(char);

        if (!shouldContinue) {
          return value;
        }

        continue;
      }

      if (this.parsingMode === 'subscript' && char.match(ExpressionInterpreter.IDENTIFIER_REGEX)) {
        this.currentSubscript += char;

        continue;
      }

      if (
        this.parsingMode === 'subscript' &&
        char === ExpressionInterpreter.ARRARY_SUBSCRIPT_CLOSE
      ) {
        const { shouldContinue, value } = this.tryArraySubscript(expression[this.index]);

        if (!shouldContinue) {
          return value;
        }

        continue;
      }

      throw new Error(
        `Unexpected token '${char}' at index ${this.index - 1} in expression: ${expression}`
      );
    }

    return this.tryFinalizeEvaluation(expression);
  }

  private reset(): void {
    this.currentIdentifier = '';
    this.currentSubscript = '';

    this.parsingMode = 'identifier';

    this.intermediateValue = this.data;
    this.index = 0;
  }

  public evaluate(expression: string): Value {
    this.reset();

    return this.walkExpression(expression);
  }
}
