import { isDefined } from '../../../utilities/isDefined';
import {
  type ColorRuleOutput,
  type Expression,
  type FdmInstanceNodeWithConnectionAndProperties,
  type FdmStylingGroupAndStyleIndex,
  type TriggerTypeData
} from '../types';
import { applyFdmMappingsNodeStyles } from './applyFdmMappingsNodeStyles';
import { traverseExpression } from './traverseExpression';

export const analyzeFdmMappingsAgainstExpression = async ({
  fdmMappings,
  expression,
  outputSelected
}: {
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<FdmStylingGroupAndStyleIndex> => {
  const allFdmtMappingsTreeNodes = await Promise.all(
    fdmMappings.map(async (mapping) => {
      const triggerData: TriggerTypeData[] = [];

      const fdmTriggerData: TriggerTypeData = {
        type: 'fdm',
        instanceNode: mapping
      };

      triggerData.push(fdmTriggerData);

      const finalGlobalOutputResult = traverseExpression(triggerData, [expression]);

      if (finalGlobalOutputResult[0] ?? false) {
        return mapping;
      }
    })
  );

  const filteredAllFdmMappingsTreeNodes = allFdmtMappingsTreeNodes.flat().filter(isDefined);
  return applyFdmMappingsNodeStyles(filteredAllFdmMappingsTreeNodes, outputSelected);
};
