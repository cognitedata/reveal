import React from 'react';

import { noop } from 'lodash';

import { Button, Tooltip } from '@cognite/cogs.js';

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
    return <Button icon="Loader" inverted onClick={noop} />;
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
    <Tooltip content="Add asset 3D-model to canvas">
      <Button icon="Cube" onClick={onClick} inverted />
    </Tooltip>
  );
};

export default ThreeDButton;
