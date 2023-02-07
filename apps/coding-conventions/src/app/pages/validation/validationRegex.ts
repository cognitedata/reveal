import {
  Convention,
  System,
  TagDefinitions,
  TagHardcoded,
  TagRange,
  TagRegex,
} from '../../types';
import { validateDataMap } from '../../utils/validateDataMap';
import toRegexRange from 'to-regex-range';

type RegexMapping = {
  regex: string;
  dependsOn: string | undefined;
  id: string;
};

type child = {
  id: string;
  regex: string;
};

type SubComponentsInRegex = {
  childRegexList: RegexMapping[];
  dependsOn: string | undefined;
  id: string;
  range: { start: number; end: number };
};

export const validate = (system: System) => {
  const fetchData = validateDataMap.get(system.type) || (() => []);
  const dataToValidate = fetchData();
  const regexForSubComponents = generateRegexForSubComponents(
    system.conventions
  );
  const regexString = buildRegex(regexForSubComponents);
  const regex = new RegExp(regexString);

  const validData = dataToValidate
    .map((item) => {
      if (regex.test(item)) {
        return item;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);

  return validData;
};

const generateRegexForSubComponents = (conventions: Convention[]) => {
  const subregexes = conventions.map((SubSystem: Convention) => {
    const regexList: RegexMapping[] = [];

    SubSystem.definitions?.forEach((definition: TagDefinitions) => {
      if (definition.type === 'Abbreviation') {
        regexList.push({
          regex: (definition as TagHardcoded).key,
          dependsOn: definition.dependsOn,
          id: definition.id,
        });
      } else if (definition.type === 'Regex') {
        regexList.push({
          regex: (definition as TagRegex).regex,
          dependsOn: definition.dependsOn,
          id: definition.id,
        });
      } else if (definition.type === 'Range') {
        const minimumCharLength =
          (definition as TagRange).minimumCharacterLength || 1;
        const range = (definition as TagRange).value;

        const min = range[0].toString().padStart(minimumCharLength, '0');
        const max = range[1].toString().padStart(minimumCharLength, '0');

        const regexForRange = toRegexRange(min, max);
        regexList.push({
          regex: regexForRange,
          dependsOn: definition.dependsOn,
          id: definition.id,
        });
      }
    });

    return {
      childRegexList: regexList,
      dependsOn: SubSystem.dependency,
      id: SubSystem.id,
      range: SubSystem.range,
    } as SubComponentsInRegex;
  });
  return subregexes;
};

const buildRegex = (subRegexes: SubComponentsInRegex[]) => {
  const allGlobalRegexes = subRegexes
    .map((subRegex) => {
      if (!subRegex.dependsOn) {
        const dependents = subRegexes.filter(
          (item) => item.dependsOn && item.dependsOn === subRegex.id
        );

        if (dependents.length === 1) {
          const dependent = dependents[0];
          const childMap = convertToChildMap(dependent.childRegexList);

          const allSubRegexes: string[] = [];
          subRegex.childRegexList.forEach((item) => {
            const deps = childMap.get(item.id) || [];
            const regexForDependents = deps.map((dep) => {
              return `${item.regex}-${dep.regex}`;
            });

            const regexForDependentsString = regexForDependents.join('|');
            if (regexForDependentsString !== '') {
              allSubRegexes.push(regexForDependentsString);
            }
          });

          const allSubRegexesString = allSubRegexes.join('|');
          return allSubRegexesString;
        } else {
          const allSubRegexes = subRegex.childRegexList.map(
            (item) => item.regex
          );
          const allSubRegexesString = allSubRegexes.join('|');
          return allSubRegexesString;
        }
      }
      return '';
    })
    .filter((item) => item !== '');

  const withNonCaptureGroup = allGlobalRegexes.map((item) => {
    if (item.startsWith('(?:') && item.endsWith(')')) {
      return item;
    } else {
      return `(?:${item})`;
    }
  });
  const regexString = withNonCaptureGroup.join('-');
  return regexString;
};

function convertToChildMap(regexList: any): Map<string, child[]> {
  return regexList.reduce((acc: Map<string, child[]>, item: any) => {
    if (item.dependsOn) {
      const existing = acc.get(item.dependsOn) || [];
      acc.set(item.dependsOn, [...existing, item]);
    } else {
      const existing = acc.get('root') || [];
      acc.set('root', [...existing, item]);
    }
    return acc;
  }, new Map());
}
