import { isFdmTrigger, isMetadataTrigger } from "../typeGuards";
import { NumericExpression } from "../types";

export const getTimeseriesExternalIdFromNumericExpression = (
  expression: NumericExpression
): string[] | undefined => {
  const trigger = expression.trigger;

  if (isMetadataTrigger(trigger)) return;

  if (isFdmTrigger(trigger)) return;

  return [trigger.externalId];
};
