import React from 'react';

import { Button } from '@cognite/cogs.js';

import { SeismicFile } from 'modules/api/types';
import { useSeismicConfig } from 'modules/seismicSearch/hooks/useSeismicConfig';
import {
  Flex,
  FlexGrow,
  MarginRightSmallContainer,
  PaddingMediumContainer,
} from 'styles/layout';

import Metadata from './Metadata';

interface Props {
  item: SeismicFile;
  handleNavigateToPrevious: () => void;
  handleNavigateToNext: () => void;
}
export const SeismicPreviewActions: React.FC<Props> = ({
  item,
  handleNavigateToNext,
  handleNavigateToPrevious,
}) => {
  const { data: config } = useSeismicConfig();

  return (
    <PaddingMediumContainer>
      <Flex>
        {config && <Metadata item={item} config={config} />}
        <FlexGrow />
        <MarginRightSmallContainer>
          <Button
            icon="LargeLeft"
            size="small"
            onClick={handleNavigateToPrevious}
            aria-label="Seismic previous"
          />
        </MarginRightSmallContainer>
        <MarginRightSmallContainer>
          <Button
            icon="LargeRight"
            size="small"
            onClick={handleNavigateToNext}
            aria-label="Seismic next"
          />
        </MarginRightSmallContainer>
      </Flex>
    </PaddingMediumContainer>
  );
};
