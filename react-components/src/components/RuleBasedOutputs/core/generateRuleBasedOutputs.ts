import { type Asset, type Datapoints } from '@cognite/sdk/';
import {
  type AllMappingStylingGroupAndStyleIndex,
  type ColorRuleOutput,
  type FdmInstanceNodeWithConnectionAndProperties,
  type Rule,
  type RuleOutput,
  type RuleOutputSet
} from '../types';
import { type AssetIdsAndTimeseries } from '../../../data-providers/types';
import { isDefined } from '../../../utilities/isDefined';
import { analyzeAssetMappingsAgainstExpression } from './analyzeAssetMappingsAgainstExpression';
import { analyzeFdmMappingsAgainstExpression } from './analyzeFdmMappingsAgainstExpression';
import { getRuleOutputFromTypeSelected } from './getRuleOutputFromTypeSelected';
import { forEachExpression } from './forEachExpression';
import { convertExpressionStringMetadataKeyToLowerCase } from './convertExpressionStringMetadataKeyToLowerCase';
import { type CdfAssetMapping } from '../../CacheProvider/types';

export const generateRuleBasedOutputs = async ({
  contextualizedAssetNodes,
  assetMappings,
  fdmMappings,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  contextualizedAssetNodes: Asset[];
  assetMappings: CdfAssetMapping[];
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AllMappingStylingGroupAndStyleIndex[]> => {
  const outputType = 'color'; // for now it only supports colors as the output

  const ruleWithOutputs = ruleSet?.rulesWithOutputs;

  return (
    await Promise.all(
      ruleWithOutputs?.map(async (ruleWithOutput: { rule: Rule; outputs: RuleOutput[] }) => {
        const { rule, outputs } = ruleWithOutput;
        // Starting Expression
        const expression = rule.expression;

        if (expression === undefined) return;

        forEachExpression(expression, convertExpressionStringMetadataKeyToLowerCase);

        const outputSelected: ColorRuleOutput | undefined = getRuleOutputFromTypeSelected(
          outputs,
          outputType
        );

        if (outputSelected === undefined) return;

        const assetMappingsStylingGroups = await analyzeAssetMappingsAgainstExpression({
          contextualizedAssetNodes,
          assetIdsAndTimeseries,
          timeseriesDatapoints,
          assetMappings,
          expression,
          outputSelected
        });

        const fdmMappingsStylingGroups = await analyzeFdmMappingsAgainstExpression({
          fdmMappings,
          expression,
          outputSelected
        });

        const allStyling: AllMappingStylingGroupAndStyleIndex = {
          assetMappingsStylingGroupAndIndex: assetMappingsStylingGroups,
          fdmStylingGroupAndStyleIndex: fdmMappingsStylingGroups
        };

        return allStyling;
      })
    )
  ).filter(isDefined);
};
