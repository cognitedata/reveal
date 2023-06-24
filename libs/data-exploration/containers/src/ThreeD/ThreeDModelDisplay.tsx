import React, { useCallback, useEffect, useState } from 'react';

import { HighlightCell } from '@data-exploration/components';

import { Detail, Flex, Icon } from '@cognite/cogs.js';

import { getObjectURL, useTranslation } from '@data-exploration-lib/core';
import {
  Model3DWithType,
  use3DModelThumbnailQuery,
  useDefault3DModelRevision,
} from '@data-exploration-lib/domain-layer';

import { ThreeDThumbnail } from './ThreeDThumbnail';

export const ThreeDModelDisplay = ({ model }: { model: Model3DWithType }) => {
  const { t } = useTranslation();
  const { data: latestRevision, isLoading: isRevisionLoading } =
    useDefault3DModelRevision(model?.id);
  const [imageUrl, setImage] = useState<string | undefined>(undefined);

  const { data: cadModelThumbnailData, isLoading: isCADModelThumbnailLoading } =
    use3DModelThumbnailQuery(latestRevision?.thumbnailURL);

  const setImageBlob = useCallback((imageData: ArrayBuffer | undefined) => {
    if (!imageData) {
      return;
    }
    const objectURL = getObjectURL(imageData);
    setImage(objectURL);
  }, []);

  useEffect(() => {
    setImageBlob(cadModelThumbnailData);

    return () => {
      setImage((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [cadModelThumbnailData, setImageBlob]);

  return (
    <Flex direction="row" gap={8} style={{ alignItems: 'center' }}>
      <ThreeDThumbnail
        imageUrl={imageUrl}
        isLoading={isCADModelThumbnailLoading}
      />
      <Flex direction="column">
        <HighlightCell text={model?.name} />
        {isRevisionLoading ? (
          <Icon type="Loader" />
        ) : (
          <Detail>
            {t(
              'LAST_VERSION_WITH_VERSION_NUMBER',
              'Last version: {{ index }}',
              {
                index: latestRevision?.index,
              }
            )}
          </Detail>
        )}
      </Flex>
    </Flex>
  );
};
