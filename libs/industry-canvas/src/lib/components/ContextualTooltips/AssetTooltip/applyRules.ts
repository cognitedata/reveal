import { last } from 'lodash';

import assertNever from '../../../utils/assertNever';
import { isNotUndefined } from '../../../utils/isNotUndefined';

import { Condition, RuleType } from './types';

const checkRule = (value: string | number, rule: RuleType): boolean => {
  switch (rule.condition) {
    case Condition.EQUALS: {
      return value === rule.comparisonValue;
    }

    case Condition.NOT_EQUALS: {
      return value !== rule.comparisonValue;
    }

    case Condition.GREATER_THAN: {
      return value > rule.comparisonValue;
    }

    case Condition.GREATER_THAN_OR_EQUAL: {
      return value >= rule.comparisonValue;
    }

    case Condition.LESS_THAN: {
      return value < rule.comparisonValue;
    }

    case Condition.LESS_THAN_OR_EQUAL: {
      return value <= rule.comparisonValue;
    }

    default: {
      assertNever(rule.condition);
    }
  }
};

const applyRules = (
  value: string | number,
  rules: RuleType[]
): string | undefined =>
  last(
    rules
      .map((rule) => (checkRule(value, rule) ? rule.then : undefined))
      .filter(isNotUndefined)
  );

export default applyRules;
