import { useContext } from 'react';

import styled from 'styled-components';

import { Button, Tooltip, toast } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../../../constants/metrics';
import { trackUsage } from '../../../../utils/Metrics';
import { ThreeDContext } from '../../contexts/ThreeDContext';
import { getStateUrl } from '../../utils';

const ShareButton = (): JSX.Element => {
  const { t } = useTranslation();
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
      viewState: { camera: viewState?.camera },
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
        <h4>{t('URL_IN_CLIPBOARD', 'URL in clipboard')}</h4>
        <p>
          {t(
            'SHAREABLE_LINK_AVAILABLE_IN_CLIPBOARD',
            `Sharable link with viewer state is now available in your clipboard.`
          )}
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
    <Tooltip
      content={t('COPY_URL_TO_STATE', 'Copy URL to current state')}
      placement="right"
    >
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
