import React from 'react';

import { noop } from 'lodash';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useDetailedMappingsByAssetIdQuery } from '@data-exploration-lib/domain-layer';

import { translationKeys } from '../../../common';
import { useTranslation } from '../../../hooks/useTranslation';

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
  const { t } = useTranslation();
  const { data: mappings, isInitialLoading } =
    useDetailedMappingsByAssetIdQuery(assetId);

  if (isInitialLoading) {
    return <Button icon="Loader" onClick={noop} inverted />;
  }

  if (mappings === undefined || mappings.length === 0) {
    return null;
  }

  const onClick = async () => {
    const mapping = mappings[0];
    onAddThreeD({
      modelId: mapping.model.id,
      revisionId: mapping.revision.id,
      initialAssetId: assetId,
    });
  };

  return (
    <Tooltip
      content={t(
        translationKeys.TOOLTIP_THREE_D_MODEL_ADD_TO_CANVAS,
        'Add 3D model to canvas'
      )}
    >
      <Button icon="Cube" onClick={onClick} inverted />
    </Tooltip>
  );
};

export default ThreeDButton;
