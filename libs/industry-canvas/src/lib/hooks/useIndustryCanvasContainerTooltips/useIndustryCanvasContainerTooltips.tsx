import {
  ContainerType,
  getPdfCache,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';
import React, { useEffect, useMemo, useState } from 'react';
import { IndustryCanvasContainerConfig } from '../../types';
import { UseManagedStateReturnType } from '../useManagedState';
import ContainerTooltip from './ContainerTooltip';
import useContainerOcrData from './useContainerOcrData';

const useIndustryCanvasContainerTooltips = ({
  clickedContainer,
  updateContainerById,
  removeContainerById,
  onAddSummarizationSticky,
}: {
  clickedContainer: IndustryCanvasContainerConfig | undefined;
  updateContainerById: UseManagedStateReturnType['updateContainerById'];
  removeContainerById: UseManagedStateReturnType['removeContainerById'];
  onAddSummarizationSticky: (
    container: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => void;
}) => {
  const [numberOfPages, setNumberOfPages] = useState<number | undefined>(
    undefined
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const { isLoading: isOcrDataLoading, data: ocrData } =
    useContainerOcrData(clickedContainer);

  useEffect(() => {
    (async () => {
      if (clickedContainer === undefined) {
        return;
      }

      if (clickedContainer.type !== ContainerType.DOCUMENT) {
        return;
      }

      try {
        const numPages = await getPdfCache().getPdfNumPages(
          clickedContainer.url
        );
        setNumberOfPages(numPages);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [clickedContainer]);

  return useMemo(() => {
    if (clickedContainer === undefined) {
      return [];
    }

    return [
      {
        targetId: clickedContainer.id,
        content: (
          <ContainerTooltip
            key={clickedContainer.id}
            container={clickedContainer}
            onAddSummarizationSticky={onAddSummarizationSticky}
            onUpdateContainer={(
              containerConfig: IndustryCanvasContainerConfig
            ) => updateContainerById(containerConfig.id, containerConfig)}
            onRemoveContainer={() => removeContainerById(clickedContainer.id)}
            shamefulNumPages={numberOfPages}
            isLoadingSummary={isLoadingSummary}
            setIsLoadingSummary={setIsLoadingSummary}
            isOcrDataLoading={isOcrDataLoading}
            ocrData={ocrData}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
      },
    ];
  }, [
    clickedContainer,
    removeContainerById,
    onAddSummarizationSticky,
    updateContainerById,
    numberOfPages,
  ]);
};

export default useIndustryCanvasContainerTooltips;
