import React, { useCallback, useEffect, useState } from 'react';

import { HighlightCell } from '@data-exploration/components';

import { Detail, Flex, Icon } from '@cognite/cogs.js';

import { getObjectURL, useTranslation } from '@data-exploration-lib/core';
import {
  Image360Data,
  use360ImageThumbnail,
  useFilesAggregateBySiteId,
} from '@data-exploration-lib/domain-layer';

import { ThreeDThumbnail } from './ThreeDThumbnail';

export const Image360Display = ({ model }: { model: Image360Data }) => {
  const { t } = useTranslation();
  const [imageUrl, setImage] = useState<string | undefined>(undefined);

  const { data: image360Data, isInitialLoading: isLoadingThumbnail } =
    use360ImageThumbnail(model.siteId);
  const {
    data: image360FileCount,
    isInitialLoading: isLoadingImage360FileCount,
  } = useFilesAggregateBySiteId(model.siteId, 'front');

  const setImageBlob = useCallback((imageData: ArrayBuffer | undefined) => {
    if (!imageData) {
      return;
    }
    const objectURL = getObjectURL(imageData);
    setImage(objectURL);
  }, []);

  useEffect(() => {
    setImageBlob(image360Data);

    return () => {
      setImage((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [image360Data, setImageBlob]);

  return (
    <Flex direction="row" gap={8} style={{ alignItems: 'center' }}>
      <ThreeDThumbnail imageUrl={imageUrl} isLoading={isLoadingThumbnail} />
      <Flex direction="column">
        <HighlightCell text={model.name} />
        {isLoadingImage360FileCount ? (
          <Icon type="Loader" />
        ) : (
          <Detail>
            {t(
              'EST_NUMBER_OF_IMAGES',
              `Est. number of images: ${image360FileCount}`,
              {
                count: image360FileCount,
              }
            )}
          </Detail>
        )}
      </Flex>
    </Flex>
  );
};
