// Mechanical extraction; the supplied reference remains unchanged.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const source = readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
const check = process.argv.includes('--check');
const targets = [
  ['A', 'prisma', 'contracts/schema.prisma'],
  ['B', 'sql', 'contracts/required-constraints.sql'],
  ['C', 'typescript', 'contracts/types.ts'],
  ['D', 'json', 'contracts/events.schema.json'],
  ['E', 'json', 'contracts/fixtures.json'],
];
for (const [letter, lang, path] of targets) {
  const section = source.split('## Apêndice '+letter+' — ')[1];
  if (!section) throw new Error('Missing appendix '+letter);
  const block = section.split('```'+lang+'\n')[1]?.split('\n```')[0];
  if (!block) throw new Error('Missing code block '+letter);
  if (lang === 'json') JSON.parse(block);
  if (check) {
    if (readFileSync(resolve(path), 'utf8').replace(/\r\n/g, '\n') !== block+'\n') {
      throw new Error('Contract differs from specification: '+path);
    }
  } else {
    mkdirSync('contracts', {recursive:true});
    writeFileSync(resolve(path), block+'\n');
  }
}
console.log(check ? 'Five reference contracts match the specification.' : 'Five reference contracts extracted without modification.');
