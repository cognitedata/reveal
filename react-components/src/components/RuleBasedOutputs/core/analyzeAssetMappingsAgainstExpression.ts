/*!
 * Copyright 2025 Cognite AS
 */
import { type Asset, type Datapoints } from '@cognite/sdk/';
import { type AssetIdsAndTimeseries } from '../../../data-providers/types';
import {
  type AssetStylingGroupAndStyleIndex,
  type ColorRuleOutput,
  type Expression,
  type TriggerTypeData
} from '../types';
import { generateTimeseriesAndDatapointsFromTheAsset } from './generateTimeseriesAndDatapointsFromTheAsset';
import { traverseExpression } from './traverseExpression';
import { applyAssetMappingsNodeStyles } from './applyAssetMappingsNodeStyles';
import { type CdfAssetMapping } from '../../CacheProvider/types';

export const analyzeAssetMappingsAgainstExpression = async ({
  contextualizedAssetNodes,
  assetIdsAndTimeseries,
  timeseriesDatapoints,
  assetMappings,
  expression,
  outputSelected
}: {
  contextualizedAssetNodes: Asset[];
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
  assetMappings: CdfAssetMapping[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<AssetStylingGroupAndStyleIndex> => {
  const allAssetMappingsTreeNodes: CdfAssetMapping[][] = [];

  for (const contextualizedAssetNode of contextualizedAssetNodes) {
    const triggerData: TriggerTypeData[] = [];

    const metadataTriggerData: TriggerTypeData = {
      type: 'metadata',
      asset: contextualizedAssetNode
    };

    triggerData.push(metadataTriggerData);

    if (
      timeseriesDatapoints !== undefined &&
      timeseriesDatapoints.length > 0 &&
      assetIdsAndTimeseries !== undefined &&
      assetIdsAndTimeseries.length > 0
    ) {
      const timeseriesDataForThisAsset = generateTimeseriesAndDatapointsFromTheAsset({
        contextualizedAssetNode,
        assetIdsAndTimeseries,
        timeseriesDatapoints
      });

      if (timeseriesDataForThisAsset.length > 0) {
        const timeseriesTriggerData: TriggerTypeData = {
          type: 'timeseries',
          timeseries: {
            timeseriesWithDatapoints: timeseriesDataForThisAsset,
            linkedAssets: contextualizedAssetNode
          }
        };

        triggerData.push(timeseriesTriggerData);
      }
    }

    const finalGlobalOutputResult = traverseExpression(triggerData, [expression]);

    if (finalGlobalOutputResult[0] ?? false) {
      const nodesFromThisAsset = assetMappings.filter(
        (item) => item.assetId === contextualizedAssetNode.id
      );

      allAssetMappingsTreeNodes.push(nodesFromThisAsset);
    }
  }

  const filteredAllAssetMappingsTreeNodes = allAssetMappingsTreeNodes.flat();
  return applyAssetMappingsNodeStyles(filteredAllAssetMappingsTreeNodes, outputSelected);
};
