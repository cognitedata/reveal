/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo } from 'react';
import { type RuleOutputSet } from '../types';
import { traverseExpressionToGetTimeseries } from '../utils';
import { isDefined } from '../../../utilities/isDefined';

export const useExtractTimeseriesIdsFromRuleSet = (ruleSet: RuleOutputSet): string[] => {
  return useMemo(() => {
    const expressions = ruleSet?.rulesWithOutputs
      .map((ruleWithOutput) => ruleWithOutput.rule.expression)
      .filter(isDefined);
    return traverseExpressionToGetTimeseries(expressions) ?? [];
  }, [ruleSet]);
};
