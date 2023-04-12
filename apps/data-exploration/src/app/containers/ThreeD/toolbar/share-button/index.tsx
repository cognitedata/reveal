import { Button, Tooltip, toast } from '@cognite/cogs.js';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { getStateUrl } from '@data-exploration-app/containers/ThreeD/utils';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useContext } from 'react';
import styled from 'styled-components';

const ShareButton = (): JSX.Element => {
  const {
    viewer,
    slicingState,
    selectedAssetId,
    assetDetailsExpanded,
    secondaryModels,
    images360,
    assetHighlightMode,
    revisionId,
  } = useContext(ThreeDContext);

  const handleShare = async () => {
    const viewState = viewer?.getViewState();
    const path = getStateUrl({
      revisionId,
      viewState,
      slicingState,
      selectedAssetId,
      assetDetailsExpanded,
      secondaryModels,
      images360: images360,
      assetHighlightMode,
    });
    const link = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(`${link}`);
    toast.info(
      <div>
        <h4>URL in clipboard</h4>
        <p>
          Sharable link with viewer state is now available in your clipboard.
        </p>
      </div>,
      { toastId: 'url-state-clipboard' }
    );
    trackUsage(EXPLORATION.THREED_SELECT.COPY_URL_TO_CLIPBOARD, {
      resourceType: '3D',
      path,
    });
  };

  return (
    <Tooltip content="Copy URL to current state" placement="right">
      <FullWidthButton
        icon="Link"
        onClick={handleShare}
        type="ghost"
        aria-label="share-button"
      />
    </Tooltip>
  );
};

const FullWidthButton = styled(Button)`
  width: 100%;
`;

export default ShareButton;
