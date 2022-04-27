import fs from 'fs';
import path from 'path';

export const removeFilesFromFolder = (
  folder: string,
  filesToRemove: string
): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${filesToRemove} from ${folder}`);
  const dirFiles = fs.readdirSync(folder);
  dirFiles.forEach((file) => {
    if (file.includes(filesToRemove)) {
      fs.rmSync(path.join(folder, file));
    }
  });
};

export const removeFromPackage = (
  file: string,
  commandToRemove: string
): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${commandToRemove} from ${file}`);
  const fileContent = fs.readFileSync(file).toString();
  const json = JSON.parse(fileContent);
  Object.keys(json.scripts).forEach((script: string) => {
    if (script.includes(commandToRemove)) {
      delete json.scripts[script];
    }
  });
  fs.writeFileSync(file, JSON.stringify(json));
};

export const removeFromBazel = (
  file: string,
  commandToRemove: string
): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${commandToRemove} from ${file}`);
  let bazelContent = fs.readFileSync(file).toString();

  const whitespace = '[^\\S\\r\\n]+';
  const re = new RegExp(
    `\n###${whitespace}${commandToRemove}${whitespace}###` +
      `[\\s\\S]+` +
      `###${whitespace}${commandToRemove}${whitespace}End${whitespace}###\n`,
    'gim'
  );
  bazelContent = bazelContent.replace(re, '');
  fs.writeFileSync(file, bazelContent);
};
