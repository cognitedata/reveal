import * as React from 'react';

import { RootAssetButton } from './RootAssetButton';
import { useCallback } from 'react';
import { Asset } from '@cognite/sdk';
import { useRootAssetQuery } from 'domain/assets/service/queries/useRootAssetQuery';
import { LoadingState } from './LoadingState';

export interface RootAssetProps {
  assetId: number;
  onClick: (rootAsset: Asset) => void;
  maxWidth?: number;
}

export const RootAsset: React.FC<RootAssetProps> = ({
  assetId,
  onClick,
  maxWidth,
}) => {
  const { data: rootAsset, isLoading } = useRootAssetQuery(assetId);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();

      if (rootAsset) {
        onClick(rootAsset);
      }
    },
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
    />
  );
};
