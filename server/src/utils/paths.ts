import path from 'path';
import { fileURLToPath } from 'url';

export function getRootDirname(): string {
  const __filename = fileURLToPath(import.meta.url);
  return path.resolve(__filename, '../../..');
}