import fs from 'fs';
import path from 'path';

export * from './transactions';

export const description = fs.readFileSync(
  path.join(__dirname, 'description.md'),
  'utf8'
);