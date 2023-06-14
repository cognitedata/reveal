import React from 'react';

import { noop } from 'lodash';

import { Menu } from '@cognite/cogs.js';

import { useDetailedMappingsByAssetIdQuery } from '@data-exploration-lib/domain-layer';

type ThreeDButtonProps = {
  assetId: number;
  onAddThreeD: ({
    modelId,
    revisionId,
    initialAssetId,
  }: {
    modelId: number;
    revisionId: number;
    initialAssetId: number;
  }) => void;
};

const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  assetId,
  onAddThreeD,
}) => {
  const { data: mappings, isInitialLoading } =
    useDetailedMappingsByAssetIdQuery(assetId);

  if (isInitialLoading) {
    return (
      <Menu.Item icon="Loader" onClick={noop} iconPlacement="left">
        Loading
      </Menu.Item>
    );
  }

  if (mappings === undefined || mappings.length === 0) {
    return null;
  }

  const onClick = async () => {
    const mapping = mappings[0];
    onAddThreeD({
      modelId: mapping.modelId,
      revisionId: mapping.revisionId,
      initialAssetId: assetId,
    });
  };

  return (
    <Menu.Item icon="Cube" onClick={onClick} iconPlacement="left">
      Show in 3D
    </Menu.Item>
  );
};

export default ThreeDButton;
