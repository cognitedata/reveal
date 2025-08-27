import { type RuleWithOutputs, type TriggerType } from '../types';
import { getExpressionTriggerTypes } from './getExpressionTriggerTypes';

export function getRuleTriggerTypes(ruleWithOutput: RuleWithOutputs): TriggerType[] | undefined {
  if (ruleWithOutput.rule.expression === undefined) return;
  return getExpressionTriggerTypes(ruleWithOutput.rule.expression);
}
