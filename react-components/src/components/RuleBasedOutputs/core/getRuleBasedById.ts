import { RuleAndEnabled } from "../types";

export const getRuleBasedById = (
  id: string | undefined,
  ruleInstances: RuleAndEnabled[] | undefined
): RuleAndEnabled | undefined => {
  return ruleInstances?.find((item) => item.rule.properties.id === id);
};
