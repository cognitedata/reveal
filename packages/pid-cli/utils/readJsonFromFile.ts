import fs from 'fs';
import path from 'path';

const readJsonFromFile = <T>(directory: string, file: string): T => {
  const graphPath = path.resolve(directory, file);
  const data = fs.readFileSync(graphPath);
  return JSON.parse(data.toString()) as T;
};

export default readJsonFromFile;
