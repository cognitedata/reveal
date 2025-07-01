import { useMemo } from 'react';
import { type RuleOutputSet } from '../types';
import { isDefined } from '../../../utilities/isDefined';
import { traverseExpressionToGetTimeseries } from '../core/traverseExpressionToGetTimeseries';

export const useExtractTimeseriesIdsFromRuleSet = (ruleSet?: RuleOutputSet): string[] => {
  return useMemo(() => {
    if (ruleSet === undefined) {
      return [];
    }
    const expressions = ruleSet.rulesWithOutputs
      .map((ruleWithOutput) => ruleWithOutput.rule.expression)
      .filter(isDefined);
    return traverseExpressionToGetTimeseries(expressions) ?? [];
  }, [ruleSet]);
};
