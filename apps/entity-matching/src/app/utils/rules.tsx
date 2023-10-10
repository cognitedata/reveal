import { ModelMapping } from '../context/QuickMatchContext';
import { Prediction } from '../hooks/entity-matching-predictions';
import { AppliedRule, Rule, RuleCondition } from '../types/rules';

export const generateAppliedRules = (
  matchFields: ModelMapping,
  predictions: Prediction[]
): AppliedRule[] => {
  const appliedRules: { [key: string]: AppliedRule } = {};
  predictions.forEach((prediction) => {
    matchFields.forEach((fields) => {
      if (fields.source === undefined || fields.target === undefined) return;

      const sourceName = prediction.source[fields.source];
      const targetName = prediction.match.target[fields.target];

      const rule = toRule(fields.source, sourceName, fields.target, targetName);
      const sourcePattern = rule.extractors[0].pattern;
      const targetPattern = rule.extractors[1].pattern;

      const key = `${fields.source},${sourcePattern},${fields.target},${targetPattern}`;
      if (!(key in appliedRules)) {
        appliedRules[key] = {
          numberOfMatches: 0,
          matches: [],
          rule: rule,
        };
      }

      appliedRules[key].matches.push({
        source: prediction.source,
        target: prediction.match.target,
      });
    });
  });

  return Object.values(appliedRules).map((r) => {
    r.numberOfMatches = r.matches.length;
    return r;
  });
};

const groupType = (c: string): string => {
  if (c.match(/[a-zA-Z]/)) {
    return 'L';
  }
  if (c.match(/[0-9]/)) {
    return 'D';
  }
  return 'S';
};

export const nameToPattern = (name: string): any[] => {
  const groupTypes = [];
  const groups = [];
  let current = 0;
  let currentType = 'None';
  for (let i = 0; i < name.length; i++) {
    const c = name[i];
    if (groupType(c) !== currentType) {
      if (i > current) {
        groups.push(name.slice(current, i));
        groupTypes.push(currentType);
      }
      current = i;
      currentType = groupType(c);
    }
  }
  if (current < name.length) {
    groups.push(name.slice(current));
    groupTypes.push(currentType);
  }
  return [groups, groupTypes];
};

export const toRule = (
  sourceField: string,
  sourceName: string,
  targetField: string,
  targetName: string
): Rule => {
  const [sourceGroups, sourceTypes] = nameToPattern(sourceName);
  const [targetGroups, targetTypes] = nameToPattern(targetName);

  const existingSourceGroups: { [key: string]: number } = {};
  for (let i = 0; i < sourceGroups.length; i++) {
    if (sourceTypes[i] !== 'S') {
      existingSourceGroups[sourceGroups[i]] =
        Object.keys(existingSourceGroups).length;
    }
  }

  const existingTargetGroups: { [key: string]: number } = {};
  for (let i = 0; i < targetGroups.length; i++) {
    if (targetTypes[i] !== 'S' && targetGroups[i] in existingSourceGroups) {
      existingTargetGroups[targetGroups[i]] =
        Object.keys(existingTargetGroups).length;
    }
  }

  let sourcePattern = '^';
  const sourceLocation: { [key: string]: number } = {};
  const targetLocation: { [key: string]: number } = {};
  let sourceIndex = 0;
  for (let i = 0; i < sourceGroups.length; i++) {
    const g = sourceGroups[i];
    if (g in existingTargetGroups) {
      sourceLocation[g] = sourceIndex;
      targetLocation[g] = existingTargetGroups[g];
    }

    const t = sourceTypes[i];
    if (t === 'S') {
      sourcePattern += g;
    } else if (t === 'L') {
      sourcePattern += '(\\p{L}+)';
      sourceIndex += 1;
    } else if (t === 'D') {
      sourcePattern += '([0-9]+)';
      sourceIndex += 1;
    }

    if (
      Object.keys(targetLocation).length >=
      Object.keys(existingTargetGroups).length
    ) {
      sourcePattern += '(.*)';
      break;
    }
  }
  sourcePattern += '$';

  let targetPattern = '^';
  for (let i = 0; i < targetGroups.length; i++) {
    const g = targetGroups[i];
    const t = targetTypes[i];
    if (t === 'S') {
      targetPattern += g;
    } else if (t === 'L') {
      targetPattern += '(\\p{L}+)';
    } else if (t === 'D') {
      targetPattern += '([0-9]+)';
    }
  }
  targetPattern += '$';

  const conditions: RuleCondition[] = [];
  Object.keys(sourceLocation).forEach((g) => {
    conditions.push({
      conditionType: 'equals',
      arguments: [
        [0, sourceLocation[g]],
        [1, targetLocation[g]],
      ],
    });
  });

  const sortedConditions = conditions.sort((a, b) => {
    return a.arguments[0][1] - b.arguments[0][1];
  });

  return {
    priority: 0,
    conditions: sortedConditions,
    extractors: [
      {
        entitySet: 'sources',
        extractorType: 'regex',
        field: sourceField,
        pattern: sourcePattern,
      },
      {
        entitySet: 'targets',
        extractorType: 'regex',
        field: targetField,
        pattern: targetPattern,
      },
    ],
  };
};
