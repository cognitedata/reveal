import * as React from 'react';

import { RootAssetButton } from './RootAssetButton';
import { useCallback } from 'react';
import { Asset } from '@cognite/sdk';
import { useRootAssetQuery } from 'domain/assets/service/queries/useRootAssetQuery';
import { LoadingState } from './LoadingState';
import { openAssetInNewTab } from 'utils/assets';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

export interface RootAssetProps {
  assetId: number;
  onClick?: (rootAsset: Asset) => void;
  maxWidth?: number;
  externalLink?: boolean;
}

export const RootAsset: React.FC<RootAssetProps> = ({
  assetId,
  onClick = openAssetInNewTab,
  maxWidth,
  externalLink,
}) => {
  const { data: rootAsset, isLoading } = useRootAssetQuery(assetId);
  const trackUsage = useMetrics();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
      maxWidth={maxWidth}
      externalLink={externalLink}
    />
  );
};
