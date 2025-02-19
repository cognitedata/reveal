import { Asset, AssetMapping3D, Datapoints } from "@cognite/sdk/";
import { AssetIdsAndTimeseries } from "../../../data-providers/types";
import { AssetStylingGroupAndStyleIndex, ColorRuleOutput, Expression, TriggerTypeData } from "../types";
import { generateTimeseriesAndDatapointsFromTheAsset } from "./generateTimeseriesAndDatapointsFromTheAsset";
import { traverseExpression } from "./traverseExpression";
import { applyAssetMappingsNodeStyles } from "./applyAssetMappingsNodeStyles";

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
  assetMappings: AssetMapping3D[];
  expression: Expression;
  outputSelected: ColorRuleOutput;
}): Promise<AssetStylingGroupAndStyleIndex> => {
  const allAssetMappingsTreeNodes: AssetMapping3D[][] = [];

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
