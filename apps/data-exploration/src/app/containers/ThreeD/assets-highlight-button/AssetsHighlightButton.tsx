import { Button, Tooltip } from '@cognite/cogs.js';
import { CogniteCadModel } from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import {
  AugmentedMapping,
  useInfiniteAssetMappings,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { SmartOverlayTool } from '@data-exploration-app/containers/ThreeD/tools/SmartOverlayTool';
import { getBoundingBoxesByNodeIds } from '@data-exploration-app/containers/ThreeD/utils';
import { useRef, useEffect, useContext } from 'react';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { useFlagAssetMappingsOverlays } from '@data-exploration-app/hooks/flags';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';

type AssetsHighlightButtonProps = {
  labelsVisibility: boolean;
  setLabelsVisibility: (visibility: boolean) => void;
  overlayTool?: SmartOverlayTool;
  threeDModel?: CogniteCadModel;
};

const AssetsHighlightButton = ({
  overlayTool,
  threeDModel,
  labelsVisibility,
  setLabelsVisibility,
}: AssetsHighlightButtonProps): JSX.Element => {
  const sdk = useSDK();
  const useOverlays = useFlagAssetMappingsOverlays();
  const { setAssetHighlightMode, assetHighlightMode } =
    useContext(ThreeDContext);
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
        newPages.flatMap((page) => page.items),
        threeDModel,
        sdk,
        overlayTool
      );
    }
  }, [labelsVisibility, assetMappings?.pages, threeDModel, overlayTool, sdk]);

  if (!threeDModel) return <></>;

  const handleAssetHighlighting = () => {
    setAssetHighlightMode(!assetHighlightMode);

    if (!useOverlays || !overlayTool) return;

    overlayTool.visible = !labelsVisibility;
    setLabelsVisibility(!labelsVisibility);
    trackUsage(EXPLORATION.CLICK.EMPHASIZE_CLICKABLE_OBJECT, {
      modelId: threeDModel?.modelId,
    });
  };
  return (
    <Tooltip content="Emphasize clickable objects" placement="right">
      <Button
        onClick={handleAssetHighlighting}
        toggled={assetHighlightMode}
        icon="Assets"
        type="ghost"
        aria-label="asset-labels-button"
      />
    </Tooltip>
  );
};

function addLabelsFromAssetMappings(
  assetMappings: AugmentedMapping[],
  threeDModel: CogniteCadModel,
  sdk: CogniteClient,
  overlayTool: SmartOverlayTool
) {
  const assetMapped3DNodes = assetMappings.map((m) => m.nodeId);

  const bbsData = getBoundingBoxesByNodeIds(
    sdk,
    threeDModel,
    assetMapped3DNodes
  );

  const assetMappedNodesMap = new Map<number, number>();
  assetMappings.forEach((m) => {
    assetMappedNodesMap.set(m.nodeId, m.assetId);
  });

  bbsData.then((data) => {
    for (const bbData of data) {
      const assetId = assetMappedNodesMap.get(bbData[0]);
      if (assetId) {
        overlayTool.add('', assetId, bbData[1].bbox);
      }
    }
  });
}

export default AssetsHighlightButton;
