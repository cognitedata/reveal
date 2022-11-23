import { Button, Tooltip } from '@cognite/cogs.js';
import { Cognite3DModel } from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import {
  AugmentedMapping,
  useInfiniteAssetMappings,
} from 'app/containers/ThreeD/hooks';
import { SmartOverlayTool } from 'app/containers/ThreeD/tools/SmartOverlayTool';
import { getBoundingBoxesByNodeIds } from 'app/containers/ThreeD/utils';
import { useRef, useEffect } from 'react';

type AssetLabelsButtonProps = {
  labelsVisibility: boolean;
  setLabelsVisibility: (visibility: boolean) => void;
  overlayTool?: SmartOverlayTool;
  threeDModel?: Cognite3DModel;
};

const AssetLabelsButton = ({
  overlayTool,
  threeDModel,
  labelsVisibility,
  setLabelsVisibility,
}: AssetLabelsButtonProps): JSX.Element => {
  const sdk = useSDK();
  const { data: assetMappings } = useInfiniteAssetMappings(
    threeDModel?.modelId,
    threeDModel?.revisionId,
    1000
  );
  // Nothing loaded yet, so index is 0 - 1.
  const loadedPagesIndex = useRef(-1);

  useEffect(() => {
    if (
      !overlayTool ||
      !assetMappings?.pages ||
      !threeDModel ||
      !labelsVisibility
    )
      return;

    if (loadedPagesIndex.current < assetMappings.pages.length - 1) {
      const newPages = assetMappings.pages.slice(
        loadedPagesIndex.current + 1,
        assetMappings.pages.length
      );
      loadedPagesIndex.current = assetMappings.pages.length - 1;
      addLabelsFromAssetMappings(
        newPages.flatMap(page => page.items),
        threeDModel,
        sdk,
        overlayTool
      );
    }
  }, [labelsVisibility, assetMappings?.pages, threeDModel, overlayTool, sdk]);

  if (!threeDModel) return <></>;

  const handleLabelsVisibility = () => {
    if (!overlayTool) return;

    overlayTool.visible = !labelsVisibility;

    setLabelsVisibility(!labelsVisibility);
  };
  return (
    <Tooltip content="Toggle labels visibility">
      <Button
        onClick={handleLabelsVisibility}
        toggled={labelsVisibility}
        icon="Comment"
        type="ghost"
        aria-label="asset-labels-button"
      />
    </Tooltip>
  );
};

function addLabelsFromAssetMappings(
  assetMappings: AugmentedMapping[],
  threeDModel: Cognite3DModel,
  sdk: CogniteClient,
  overlayTool: SmartOverlayTool
) {
  const assetMapped3DNodes = assetMappings.map(m => m.nodeId);

  const bbsData = getBoundingBoxesByNodeIds(
    sdk,
    threeDModel,
    assetMapped3DNodes
  );

  const assetMappedNodesMap = new Map<number, number>();
  assetMappings.forEach(m => {
    assetMappedNodesMap.set(m.nodeId, m.assetId);
  });

  bbsData.then(data => {
    for (const bbData of data) {
      const assetId = assetMappedNodesMap.get(bbData[0]);
      if (assetId) {
        overlayTool.add('', assetId, bbData[1].bbox);
      }
    }
  });
}

export default AssetLabelsButton;
