import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function getSubappInfo(subapp: string): string | null {
  const content = readFileSync(
    resolve(__dirname, '../../../', subapp, 'project.json')
  );
  const project = JSON.parse(content.toString('utf-8'));
  return project?.pipeline?.previewPackageName || null;
}
