import React from 'react';

import styled from 'styled-components';

import isString from 'lodash/isString';

import { RuleCondition, RuleExtractor, RuleMatch } from '../types/rules';

type Color = {
  bg: string;
  text: string;
};

const colors: Color[] = [
  {
    bg: '#F0FCFE',
    text: '#075A75',
  },
  {
    bg: '#FFFAED',
    text: '#804500',
  },
  {
    bg: '#F4F6FF',
    text: '#075A75',
  },
  {
    bg: '#FFF6F1',
    text: '#A01D00',
  },
  {
    bg: '#FBF2FC',
    text: '#2b3a88',
  },
  {
    bg: '#FFF9F7',
    text: '#ae1f00',
  },
  {
    bg: '#FFDEEC',
    text: '#8d1e47',
  },
  {
    bg: '#FAE6FF',
    text: '#642175',
  },
];

const ColoredMatch = styled.span.attrs(({ index }: { index: number }) => {
  const colorIndex = index >= colors.length ? index % colors.length : index;
  const color: Color = colors[colorIndex];
  return {
    style: {
      color: color.text,
      backgroundColor: color.bg,
    },
  };
})<{ index: number }>`
  padding: 2px 3px;
`;

export type ColoredExtractor = {
  entitySet: 'sources' | 'targets';
  extractorType: 'regex';
  field: string;
  pattern: string | React.ReactNode[];
};

export type ColoredRule = {
  numberOfMatches: number;
  averageScore: number;
  matches: RuleMatch[];
  conditions: RuleCondition[];
  extractors: ColoredExtractor[];
};

type ExtendedExtractor = RuleExtractor & {
  group?: string[];
  fixedPattern?: React.ReactNode[];
};

type ExtendedCondition = RuleCondition & {
  extractor: number;
  position: number;
};

/**
 * Main function responsible for coloring everything belonging to a rule:
 * main pattern, as well as matches.
 * @param rule - a single rule to color
 */
export const colorRule = (
  numberOfMatches: number,
  averageScore: number,
  conditions: RuleCondition[],
  extractors: RuleExtractor[],
  matches: RuleMatch[]
): ColoredRule => {
  const mapExtractors = (match: RuleMatch): ExtendedExtractor[] =>
    extractors.map((extractor: RuleExtractor) => {
      const text = getTextField(match, extractor);
      const jsPattern = getJsPattern(extractor.pattern);
      const regexGroups = getRegexGroups(text, jsPattern);
      return {
        ...extractor,
        pattern: jsPattern,
        group: regexGroups,
      };
    });

  const mappedConditions = (): ExtendedCondition[][] =>
    conditions
      .filter(
        (condition: RuleCondition) => condition.conditionType === 'equals'
      )
      .map((condition: RuleCondition) =>
        condition.arguments.map((argument: number[]) => ({
          ...condition,
          extractor: argument[0],
          position: argument[1],
        }))
      );

  const extendedConditions: ExtendedCondition[][] = mappedConditions();

  const coloredExtractors: ColoredExtractor[] = colorRegexPatterns(
    extractors,
    extendedConditions
  );

  const coloredMatches: RuleMatch[] = matches.map((match: RuleMatch) => {
    const mappedExtractors = mapExtractors(match);
    return colorRegexGroups(match, mappedExtractors, extendedConditions);
  });

  return {
    numberOfMatches: numberOfMatches,
    averageScore: averageScore,
    conditions: conditions,
    extractors: coloredExtractors,
    matches: coloredMatches,
  };
};

/**
 * Extracts a field from the match (ex. name or description),
 * based on argument provided by extractor.
 * @param match - a single match
 * @param extractor - a single extractor
 */
const getTextField = (match: RuleMatch, extractor: RuleExtractor): string => {
  if (extractor.entitySet === 'sources') {
    const text = match.source[extractor.field];
    return isString(text) ? text : '';
  }
  if (extractor.entitySet === 'targets') {
    const text = match.target[extractor.field];
    return isString(text) ? text : '';
  }
  return '';
};

/**
 * Splits a text field into groups and then clears the resulting array from unnecesary fields.
 * Unnecesary fields include: first field which is always the full string,
 * index field and groups array.
 * @param text - string to split
 * @param pattern - a string representing regex pattern (must be in JS format)
 */
const getRegexGroups = (text: unknown, pattern: string): any[] => {
  if (!isString(text)) {
    return [];
  }
  const regexPattern = new RegExp(pattern);
  const regexedText = regexPattern.exec(text);
  const regexedGroups = regexedText ? [...regexedText] : [];
  regexedGroups.shift();
  return regexedGroups?.length ? regexedGroups : [];
};

/**
 * Colors the matched strings for a single match. The resulting array does not contain non-alphanumeric characters.
 * Returns the array of colored tokens.
 * @param match
 * @param extractors
 * @param conditions
 */
const colorRegexGroups = (
  match: RuleMatch,
  extractors: ExtendedExtractor[],
  conditions: ExtendedCondition[][]
) => {
  const newMatch: RuleMatch = {
    ...match,
    source: { id: match.source.id },
    target: { id: match.target.id },
  };
  conditions.forEach((conditionsList: ExtendedCondition[], index: number) =>
    conditionsList.map((condition: ExtendedCondition) => {
      const extractor = extractors[condition.extractor];
      const jsPattern = getJsPattern(extractor.pattern);
      if (extractor.entitySet === 'sources') {
        const matchGroup: React.ReactNode[] =
          (newMatch.source[extractor.field] as unknown as React.ReactNode[]) ??
          getRegexGroups(match.source[extractor.field], extractor.pattern);
        const coloredGroup = insertColoredField(
          matchGroup,
          condition.position,
          index
        );
        newMatch.source[extractor.field] = coloredGroup;
        if (index === conditions.length - 1 && isString(jsPattern)) {
          const text = match.source[extractor.field];
          if (isString(text)) {
            const fixedGroup = insertSymbolsToPattern(
              text,
              jsPattern,
              coloredGroup
            );
            newMatch.source[extractor.field] = fixedGroup;
          }
        }
      }
      if (extractor.entitySet === 'targets') {
        const matchGroup: React.ReactNode[] =
          (newMatch.target[extractor.field] as unknown as React.ReactNode[]) ??
          getRegexGroups(match.target[extractor.field], extractor.pattern);
        const coloredGroup = insertColoredField(
          matchGroup,
          condition.position,
          index
        );
        newMatch.target[extractor.field] = coloredGroup;
        if (index === conditions.length - 1 && isString(jsPattern)) {
          const text = match.target[extractor.field];
          if (isString(text)) {
            const fixedGroup = insertSymbolsToPattern(
              text,
              jsPattern,
              coloredGroup
            );
            newMatch.target[extractor.field] = fixedGroup;
          }
        }
      }
      return condition;
    })
  );
  return newMatch;
};

/**
 * Colors patterns representing the regex, which was used to generate matches.
 * Returns a modified array of extractors.
 * @param extractors
 * @param conditions
 */
const colorRegexPatterns = (
  extractors: ExtendedExtractor[],
  conditions: ExtendedCondition[][]
): ColoredExtractor[] => {
  const coloredExtractors: { [key: number]: ExtendedExtractor } = [
    ...extractors,
  ];
  conditions.map((conditionsList: ExtendedCondition[], index: number) => {
    return conditionsList.map((condition: ExtendedCondition) => {
      const isProcessed = !!coloredExtractors[condition.extractor];
      const extractor = isProcessed
        ? {
            ...coloredExtractors[condition.extractor],
          }
        : {
            ...extractors[condition.extractor],
          };
      const text = regexToString(extractor.pattern).replace(/D/g, '0');
      const jsPattern = getJsPattern(extractor.pattern);
      const patternGroup =
        extractor.fixedPattern ??
        getRegexGroups(text, jsPattern).map(
          (element: string | React.ReactNode) =>
            isString(element) ? element.replace(/0/g, 'D') : element
        );
      const coloredGroup = insertColoredField(
        patternGroup,
        condition.position,
        index
      );
      extractor.fixedPattern = coloredGroup;
      coloredExtractors[condition.extractor] = extractor;
      if (index === conditions.length - 1 && isString(jsPattern)) {
        const fixedGroup = insertSymbolsToPattern(
          text,
          jsPattern,
          patternGroup
        );
        extractor.fixedPattern = fixedGroup;
        coloredExtractors[condition.extractor] = extractor;
      }
      return condition;
    });
  });

  return Object.values(coloredExtractors).map(
    (extractor: ExtendedExtractor) => {
      const pattern = extractor.fixedPattern ?? '';
      return {
        ...extractor,
        pattern: pattern,
      };
    }
  );
};

/**
 * Replaces a token in the array with the same token, but colored.
 * Returns the colored group.
 * @param group - an array of regex-split string
 * @param position - position of token that needs to be swapped
 * @param index - an arbitrary number for giving React element a key
 */
const insertColoredField = (group: any[], position: number, index: number) => {
  group.splice(
    position,
    1,
    <ColoredMatch
      index={index}
      key={`match-${index.toString()}-condition-${position}`}
    >
      {group[position]}
    </ColoredMatch>
  );
  return group;
};

/**
 * Inserts non-alphanumeric characters back into the previously colored string.
 * Returns a full array with both non-alphanumeric characters and colored strings.
 * @param text - original string
 * @param pattern - original pattern (JS version)
 * @param coloredTokens - array with already colored tokens
 */
export const insertSymbolsToPattern = (
  text: string,
  pattern: any,
  coloredTokens: any
) => {
  const fullPattern = pattern
    .replaceAll('([0-9]+)', 'D')
    .replaceAll('([a-zA-Z]+)', 'L')
    .replaceAll('(.*)', 'R')
    // eslint-disable-next-line no-useless-escape
    .replace(/[^L|D|R|\^|\$$]/g, (match: string) => `([${match}])`)
    .replaceAll('D', '([0-9]+)')
    .replaceAll('L', '([a-zA-Z]+)')
    .replaceAll('R', '(.*)');
  const patternRegex = new RegExp(pattern);
  const fullPatternRegex = new RegExp(fullPattern);
  const originalTokens = [...(patternRegex.exec(text) ?? [])].map(
    (element: string) => (element === '0' ? 'D' : element)
  );
  const allTokens = [...(fullPatternRegex.exec(text) ?? [])].map(
    (element: string) => (element === '0' ? 'D' : element)
  );
  // first element is always the full original string so we remove it
  originalTokens.shift();
  allTokens.shift();

  let lastTokenIndex = 0;
  // we get the respective position of tokens in both original array
  // and the altered one (without dashes, spaces etc.)
  const positionsToSwap = originalTokens.map(
    (token: string, originalTokenIndex: number) => {
      const newTokenIndex = allTokens.indexOf(token, lastTokenIndex);
      lastTokenIndex = newTokenIndex + 1;
      return [originalTokenIndex, newTokenIndex];
    }
  );

  // now we insert the matching groups into the full array,
  // between dashes and spaces
  positionsToSwap.forEach((position: number[]) =>
    allTokens.splice(position[1], 1, coloredTokens[position[0]])
  );
  return allTokens;
};

/**
 * Remakes a regex string to look a bit more human-friendly.
 * @param input
 */
export const regexToString = (input: any) =>
  input
    .replaceAll('(\\p{L}+)', 'L')
    .replaceAll('([0-9]+)', 'D')
    .replaceAll('(.*)', '...')
    .replaceAll('$', '')
    .replaceAll('^', '')
    .replaceAll('\\', '');

/**
 * Changes default PCRE regex to JS accepted standard
 * @param pattern
 */
export const getJsPattern = (pattern: string) => {
  return isString(pattern) ? pattern.replace(/\\p{L}/g, '[a-zA-Z]') : pattern;
};
