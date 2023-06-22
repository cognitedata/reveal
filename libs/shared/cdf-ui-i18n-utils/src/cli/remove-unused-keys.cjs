const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_IN_BYTES = 1024 * 1024 * 10; // 10MB

const searchFile = (filePath, str) => {
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE_IN_BYTES) {
    // do not read files that are bigger than specified size
    return false;
  }

  const file = fs.readFileSync(filePath, 'utf-8');
  return file.includes(str);
};

const searchDir = (dirPath, str, extensions) => {
  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

  const filePaths = dirents
    .filter((dirent) => {
      // filter files
      if (!dirent.isFile()) {
        return false;
      }

      // filter allowed extensions
      const lastIndexOfDot = dirent.name.lastIndexOf('.');
      const extension = dirent.name.substring(lastIndexOfDot);
      return extensions.includes(extension);
    })
    .map((dirent) => path.join(dirPath, dirent.name));

  if (filePaths.some((p) => searchFile(p, str))) {
    return true;
  }

  const dirPaths = dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(dirPath, dirent.name));

  return dirPaths.some((p) => searchDir(p, str, extensions));
};

module.exports = async function (options) {
  fs.readdir(options.path, (languageDirectoryError, languages) => {
    if (languageDirectoryError || !languages) {
      throw new Error(
        `error occurred while reading the directory: ${JSON.stringify(
          languageDirectoryError
        )}`
      );
    }

    const language = languages.find(
      (language) => language === options.sourceLanguage
    );

    if (!language) {
      throw new Error(
        `no translation found for the language: ${options.sourceLanguage}`
      );
    }

    const languageDirectoryPath = path.join(options.path, language);

    fs.readdir(languageDirectoryPath, (fileError, files) => {
      if (fileError || !files) {
        throw new Error(
          `error occurred while reading the directory: ${JSON.stringify(
            fileError
          )}`
        );
      }

      files.forEach((file) => {
        const filePath = path.join(languageDirectoryPath, file);

        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const keys = Object.keys(data);

          const dirs = options.folders.split(',');
          const extensions = options.extensions.split(',');
          const keysToRemove = keys.filter((key) => {
            return dirs.every((dir) => !searchDir(dir, key, extensions));
          });

          if (keysToRemove.length) {
            keysToRemove.forEach((key) => {
              delete data[key];
            });
            console.log(
              `keys are removed from source language file: ${keysToRemove.join(
                ', '
              )}`
            );
          } else {
            console.log('not found any unused key');
          }

          let fileContent = JSON.stringify(data, null, 2);
          fileContent += '\n';

          fs.writeFileSync(filePath, fileContent);
        } catch (error) {
          throw new Error(
            `error occurred while searching the keys: ${JSON.stringify(error)}`
          );
        }
      });
    });
  });
};
