import { describe, expect, it } from 'vitest';

import { ExpressionInterpreter } from '../src/expression-interpreter';

const data = {
  array: [1, 2, 3],
  complex: {
    nested: {
      nested: [[{ foo: [{ bar: 2 }] }]]
    }
  },
  count: 1,
  name: 'Test',
  nested: {
    nestedArray: [{ foo: 1 }],
    value: 'Nested Value'
  },
  twoDArray: [
    [1, 2],
    [3, 4]
  ]
};

const interpreter = new ExpressionInterpreter(data);

function basicTests(): void {
  it('should evaluate simple 1-level expressions', () => {
    expect(interpreter.evaluate('count')).toBe(data.count);
    expect(interpreter.evaluate('name')).toBe(data.name);
  });

  it('should evaluate simple 2-level nested expressions', () => {
    expect(interpreter.evaluate('nested.value')).toBe(data.nested.value);
  });

  it.for([
    [0, data.array[0]],
    [1, data.array[1]],
    [2, data.array[2]],
    // oxlint-disable-next-line no-undefined This is intentional as we need to test for undefined
    [3, undefined]
  ])('should evaluate array subscript expressions array[%i]', ([index, expected]) => {
    expect(interpreter.evaluate(`array[${index}]`)).toBe(expected);
  });
}

function complexTests(): void {
  it('should evaluate nested array subscript expressions', () => {
    expect(interpreter.evaluate('nested.nestedArray[0].foo')).toBe(1);
  });

  it.for([
    [0, 0, data.twoDArray[0][0]],
    [0, 1, data.twoDArray[0][1]],
    [1, 0, data.twoDArray[1][0]],
    [1, 1, data.twoDArray[1][1]]
  ])('should evaluate 2D array subscript expressions twoDArray[%i][%i]', ([row, col, expected]) => {
    expect(interpreter.evaluate(`twoDArray[${row}][${col}]`)).toBe(expected);
  });

  it('should evaluate complex nested expressions', () => {
    expect(interpreter.evaluate('complex.nested.nested[0][0].foo[0].bar')).toBe(2);
  });
}

function edgeCasesAndErrors(): void {
  it('should return undefined for non-existent expressions', () => {
    expect(interpreter.evaluate('nonExistent')).toBeUndefined();
  });

  it('should throw an error for invalid expressions', () => {
    expect(() => interpreter.evaluate('nested[0]')).toThrow(
      `Invalid intermediate value for array subscript access on non-array: ${JSON.stringify(data.nested)}`
    );

    expect(() => interpreter.evaluate('array.foo[0]')).toThrow(
      `Invalid intermediate value for member access on array: ${JSON.stringify(data.array)}`
    );

    expect(() => interpreter.evaluate('twoDArray[0]')).toThrow(
      `Expected a value of type string, number, boolean, null, or undefined, but got: ${JSON.stringify(data.twoDArray[0])}`
    );

    expect(() => interpreter.evaluate('complex.nested.')).toThrow(
      `Unexpected end of expression: complex.nested.`
    );

    expect(() => interpreter.evaluate('complex..nested')).toThrow(
      'Tried to access a member on an object, but no identifier was provided.'
    );

    expect(() => interpreter.evaluate('array[]')).toThrow(
      `Tried to access an array subscript, but no index was provided.`
    );

    expect(() => interpreter.evaluate('arr;ay[0]')).toThrow(
      `Unexpected token ';' at index 3 in expression: arr;ay[0]`
    );
  });
}

describe('ExpressionInterpreter', () => {
  basicTests();

  complexTests();

  edgeCasesAndErrors();
});
