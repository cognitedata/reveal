import * as React from 'react';

import { RootAssetButton } from './RootAssetButton';
import { useCallback } from 'react';
import { Asset } from '@cognite/sdk';
import { useRootAssetQuery } from '@data-exploration-lib/domain-layer';
import { LoadingState } from './LoadingState';
import { openAssetInNewTab } from '@data-exploration-components/utils/assets';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

export interface RootAssetProps {
  assetId: number;
  onClick?: (rootAsset: Asset) => void;
  externalLink?: boolean;
}

export const RootAsset: React.FC<RootAssetProps> = ({
  assetId,
  onClick = openAssetInNewTab,

  externalLink,
}) => {
  const { data: rootAsset, isLoading } = useRootAssetQuery(assetId);
  const trackUsage = useMetrics();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      if (rootAsset) {
        trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.ROOT_ASSET, {
          name: rootAsset.name,
        });
        onClick(rootAsset);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClick, rootAsset]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!rootAsset) {
    return null;
  }

  return (
    <RootAssetButton
      label={rootAsset.name}
      onClick={handleClick}
      externalLink={externalLink}
    />
  );
};
