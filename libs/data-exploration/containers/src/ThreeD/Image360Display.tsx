import React, { useCallback, useEffect, useState } from 'react';

import { HighlightCell } from '@data-exploration/components';

import { Detail, Flex, Icon } from '@cognite/cogs.js';

import { getObjectURL } from '@data-exploration-lib/core';
import {
  Model3DWithType,
  use360ImageThumbnail,
  useFilesAggregateBySiteId,
} from '@data-exploration-lib/domain-layer';

import { ThreeDThumbnail } from './ThreeDThumbnail';

export const Image360Display = ({ model }: { model: Model3DWithType }) => {
  const [imageUrl, setImage] = useState<string | undefined>(undefined);

  const { data: image360Data, isFetched: isFetchedThumbnail } =
    use360ImageThumbnail(model.siteId);
  const { data: image360FileCount, isFetched: isFetchedFileCount } =
    useFilesAggregateBySiteId(model.siteId, 'front');

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
      <ThreeDThumbnail imageUrl={imageUrl} isLoading={!isFetchedThumbnail} />
      <Flex direction="column">
        <HighlightCell text={model?.name} />
        {!isFetchedFileCount ? (
          <Icon type="Loader" />
        ) : (
          <Detail>
            Est. number of images: <>{image360FileCount}</>
          </Detail>
        )}
      </Flex>
    </Flex>
  );
};
