import { last } from 'lodash';

import assertNever from '../../../utils/assertNever';
import { isNotUndefined } from '../../../utils/isNotUndefined';

import isNumberString from './isNumberString';
import { Condition, RuleType } from './types';

const checkRule = (value: number, rule: RuleType): boolean => {
  const comparisonValue = rule.comparisonValue;
  if (!isNumberString(comparisonValue)) {
    // We don't try to compare non-number strings;
    return false;
  }

  const comparisonValueAsNumber = Number(comparisonValue);
  switch (rule.condition) {
    case Condition.EQUALS: {
      return value === comparisonValueAsNumber;
    }

    case Condition.NOT_EQUALS: {
      return value !== comparisonValueAsNumber;
    }

    case Condition.GREATER_THAN: {
      return value > comparisonValueAsNumber;
    }

    case Condition.GREATER_THAN_OR_EQUAL: {
      return value >= comparisonValueAsNumber;
    }

    case Condition.LESS_THAN: {
      return value < comparisonValueAsNumber;
    }

    case Condition.LESS_THAN_OR_EQUAL: {
      return value <= comparisonValueAsNumber;
    }

    default: {
      assertNever(rule.condition);
    }
  }
};

const applyRules = (value: number, rules: RuleType[]): string | undefined =>
  last(
    rules
      .map((rule) => (checkRule(value, rule) ? rule.then : undefined))
      .filter(isNotUndefined)
  );

export default applyRules;
