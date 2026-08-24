import { readFile, writeFile } from 'node:fs/promises';

import data from './data.json' with { type: 'json' };
import { ExpressionInterpreter } from './expression-interpreter.ts';

// This is relative to the project root (the directory where node runs)
const TEMPLATE_PATH = './src/README.template.md';
const OUTPUT_PATH = './README.md';

const interpreter = new ExpressionInterpreter(data);
const template = await readFile(TEMPLATE_PATH, 'utf8');

const expressions = template.matchAll(ExpressionInterpreter.EXPRESSION_REGEX) ?? [];

let result = template;

for (const [expression] of expressions) {
  const evaluatedValue = interpreter.evaluate(expression);
  const substitutedValue =
    typeof evaluatedValue === 'string' ? evaluatedValue : JSON.stringify(evaluatedValue);

  result = result.replaceAll(`{${expression}}`, substitutedValue);
}

await writeFile(OUTPUT_PATH, result, 'utf8');
