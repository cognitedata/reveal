import toRegexRange from 'to-regex-range';
import {
  Convention,
  System,
  TagDefinitions,
  TagAbbreviation,
  TagRange,
  TagRegex,
} from '../types';
import { validateDataMap } from './validateDataMap';

export type BackTrackInterface = {
  text: string;
  tagDefinitionId: string;
  tagConventionId: string;
};

const getValidTag = (tag: string, conventions: Convention[]): string | null => {
  const previousMatches: BackTrackInterface[] = [];
  if (backTrackingIsValid(tag, conventions, previousMatches)) {
    return tag;
  }
  return null;
};

export const validate = (
  system: System,
  conventions: Convention[],
  tags?: string[]
): string[] => {
  conventions.sort((a, b) => a.start - b.start);
  const fetchData = validateDataMap.get('files') || (() => []);
  const dataToValidate = tags ? tags : fetchData();

  const transformedConventions = getConventionsWithSeperators(
    system,
    conventions
  );

  const validTags = dataToValidate.reduce(
    (result: string[], current: string) => {
      const validTag = getValidTag(current, transformedConventions);
      if (validTag) {
        return [...result, validTag];
      } else {
        return result;
      }
    },
    []
  );

  return validTags;
};

const newHardCodedSeperator = (
  text: string,
  start: number,
  end: number
): Convention => {
  return {
    start: start,
    end: end,
    keyword: text,
    id: 'hardcoded-seperator' + start + ':' + end,
    name: 'Hardcoded seperator',
    systemId: 'N/A',
    definitions: [
      {
        type: 'Abbreviation',
        key: text,
        description: 'Hardcoded seperator',
        id: 'hardcoded-seperator_Sub_' + start + ':' + end,
      },
    ],
  };
};

export const getConventionsWithSeperators = (
  system: System,
  conventions: Convention[]
): Convention[] => {
  if (!system.structure) {
    return [];
  }
  const schema = system.structure;
  // when iterating over system.conventions, there are part of the schema that are not part of the convention
  // e.g. the seperators. We need to add them to the convention so that we can iterate over them

  const newConventions: Convention[] = [];
  let lastInd = 0;
  conventions.forEach((convention) => {
    // get the start and stop index of the convention
    const start = convention.start;
    const end = convention.end;
    if (start > lastInd) {
      // if there is a seperator between the last convention and this one, add it to the newConventions
      const seperator = schema.slice(lastInd, start);
      newConventions.push(newHardCodedSeperator(seperator, lastInd, start));
    }
    newConventions.push(convention);
    lastInd = end;
  });

  // if there is a seperator at the end, add it to the newConventions
  if (lastInd < schema.length) {
    const seperator = schema.slice(lastInd);
    newConventions.push(
      newHardCodedSeperator(seperator, lastInd, schema.length)
    );
  }
  return newConventions;
};

const getNextConvention = (
  conventions: Convention[],
  lastConventionId?: string
) => {
  const lastConventionIndex = conventions.findIndex(
    (item) => item.id === lastConventionId
  );

  if (lastConventionIndex === -1) {
    return conventions[0];
  }

  const nextConvention = conventions[lastConventionIndex + 1];
  return nextConvention;
};

export const backTrackingIsValid = (
  remainingText: string,
  conventions: Convention[],
  previousMatches: BackTrackInterface[]
): boolean => {
  if (remainingText.length === 0) {
    // if there is no text left and we have matched all the non-optional conventions, then it is valid
    const allNonOptionalConventionsHaveBeenMatched = conventions.every(
      (convention) => {
        if (convention.optional) {
          return true;
        }

        const hasBeenMatched = previousMatches.some(
          (match) => match.tagConventionId === convention.id
        );
        return hasBeenMatched;
      }
    );
    return allNonOptionalConventionsHaveBeenMatched;
  }

  const currentConvention = getNextConvention(
    conventions,
    previousMatches[previousMatches.length - 1]?.tagConventionId
  );

  if (!currentConvention) {
    return false;
  }

  // check if any of the definitions match, is so add to previous matches and recurse
  // find all definitions that match
  type MatchedDefinition = {
    newRemainingText: string;
    text: string;
    tagDefinitionId: string;
    tagConventionId: string;
  };
  const matchedDefinition = currentConvention.definitions?.reduce(
    (matches: MatchedDefinition[], definition: TagDefinitions) => {
      let regexString = 'NOTAMATCH';
      if (definition.type === 'Abbreviation') {
        regexString = `^(${(definition as TagAbbreviation).key})`;
      } else if (definition.type === 'Regex') {
        regexString = `^(${(definition as TagRegex).regex})`;
      } else if (definition.type === 'Range') {
        const minimummCharLength =
          (definition as TagRange).minimumCharacterLength || 1;
        const range = (definition as TagRange).value;

        const min = range[0].toString().padStart(minimummCharLength, '0');
        const max = range[1].toString().padStart(minimummCharLength, '0');

        const regexForRange = toRegexRange(min, max, { relaxZeros: false });
        regexString = `^(${regexForRange})`;
      }
      if (new RegExp(regexString).test(remainingText)) {
        // if it is dependent on another tag, check if we have matched on it already, if not, return false
        if (definition.dependsOn) {
          const hasDependentBeenMatched = previousMatches.some(
            (prevMatch) => prevMatch.tagDefinitionId === definition.dependsOn
          );
          if (!hasDependentBeenMatched) {
            return matches;
          }
        }
        const regex = new RegExp(regexString + '$');
        const results = [];
        // We do this loop, in case of multiple matches, we want to return all of them
        // example. 1-99, with no zero padding. if the text is 10, we want to return 1 and 10.
        for (let i = 0; i < remainingText.length; i++) {
          const textToMatchOn = remainingText.slice(0, i + 1);
          const matchedText = textToMatchOn.match(regex)?.[0];
          if (matchedText) {
            const newRemainingText = remainingText.slice(matchedText.length);
            results.push({
              newRemainingText: newRemainingText,
              text: matchedText,
              tagDefinitionId: definition.id,
              tagConventionId: currentConvention.id,
            });
          }
        }
        return [...matches, ...results];
      }
      return matches;
    },
    []
  );

  // if we have a match, continue backtracking
  if (matchedDefinition) {
    const foundMatch = matchedDefinition.some((definition): boolean => {
      if (definition) {
        const newPreviousMatches = [...previousMatches, definition];
        return backTrackingIsValid(
          definition.newRemainingText,
          conventions,
          newPreviousMatches
        );
      }
      return false;
    });
    if (foundMatch) {
      return true;
    }
  }

  if (currentConvention.optional === true) {
    const newPreviousMatches: BackTrackInterface[] = [
      ...previousMatches,
      {
        newRemainingText: remainingText,
        text: '',
        tagDefinitionId: '',
        tagConventionId: currentConvention.id,
      } as MatchedDefinition,
    ];
    return backTrackingIsValid(remainingText, conventions, newPreviousMatches);
  }

  return false;
};
