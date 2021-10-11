// This is based on https://github.com/moroshko/autosuggest-highlight, which isn't maintained anymore.
// I've added it here, so it's up to cognite if they want to fork the original lib and add it to their own github.
// var removeDiacritics = require('diacritic').clean;

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
const specialCharsRegex = /[.*+?^${}()|[\]\\]/g;

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.10.2.6
const wordCharacterRegex = /[a-z0-9_]/i;

const whitespacesRegex = /\s+/;

function escapeRegexCharacters(str: string) {
  return str.replace(specialCharsRegex, '\\$&');
}

interface Options {
  insideWords: boolean;
  findAllOccurrences: boolean;
  requireMatchAll: boolean;
}

const defaultOptions: Options = {
  insideWords: false,
  findAllOccurrences: false,
  requireMatchAll: false,
};

export const match = (
  text: string,
  query: string,
  options?: Partial<Options>
) => {
  // Should probably discuss whether or not we're gonna support this (clean diacritic).
  //   processedText = removeDiacritics(text);
  //   query = removeDiacritics(query);

  const { insideWords, findAllOccurrences, requireMatchAll } = {
    ...defaultOptions,
    ...options,
  };

  let processedText = text;
  return (
    query
      .trim()
      .split(whitespacesRegex)
      // If query is blank, we'll get empty string here, so let's filter it out.
      .filter((word: string) => {
        return word.length > 0;
      })
      .reduce((result: any[], word: string) => {
        const wordLen = word.length;
        const prefix =
          !insideWords && wordCharacterRegex.test(word[0]) ? '\\b' : '';
        const regex = new RegExp(prefix + escapeRegexCharacters(word), 'i');
        let occurrence;
        let index: number;

        occurrence = regex.exec(processedText);
        if (requireMatchAll && occurrence === null) {
          processedText = '';
          return [];
        }

        while (occurrence) {
          index = occurrence.index;
          result.push([index, index + wordLen]);

          // Replace what we just found with spaces so we don't find it again.
          processedText =
            processedText.slice(0, index) +
            new Array(wordLen + 1).join(' ') +
            processedText.slice(index + wordLen);

          if (!findAllOccurrences) {
            break;
          }

          occurrence = regex.exec(processedText);
        }

        return result;
      }, [])
      .sort((match1: any, match2: any) => {
        return match1[0] - match2[0];
      })
  );
};

export default match;
