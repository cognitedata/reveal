const fs = require('fs');
const path = require('path');

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
          const entries = Object.entries(data);
          const sortedEntries = entries.sort((entryA, entryB) =>
            entryA[0].localeCompare(entryB[0])
          );
          const sortedData = Object.fromEntries(sortedEntries);
          fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2));
        } catch (sortError) {
          throw new Error(
            `error occurred while sorting the file "${filePath}": ${JSON.stringify(
              sortError
            )}`
          );
        }
      });
    });
  });
};
