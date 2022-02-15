import React from 'react';

import { SeismicFile } from 'services/types';

import { Button } from '@cognite/cogs.js';

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
            icon="ChevronLeftLarge"
            size="small"
            onClick={handleNavigateToPrevious}
            aria-label="Seismic previous"
          />
        </MarginRightSmallContainer>
        <MarginRightSmallContainer>
          <Button
            icon="ChevronRightLarge"
            size="small"
            onClick={handleNavigateToNext}
            aria-label="Seismic next"
          />
        </MarginRightSmallContainer>
      </Flex>
    </PaddingMediumContainer>
  );
};
