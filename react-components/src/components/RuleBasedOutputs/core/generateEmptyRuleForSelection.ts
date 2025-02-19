import { EmptyRuleForSelection } from "../types";

export const generateEmptyRuleForSelection = (name: string): EmptyRuleForSelection => {
  const emptySelection: EmptyRuleForSelection = {
    rule: {
      properties: {
        id: undefined,
        name,
        isNoSelection: true
      }
    },
    isEnabled: false
  };
  return emptySelection;
};
