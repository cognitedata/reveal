import { useEffect, useMemo, useState } from 'react';

import {
  ContainerType,
  getPdfCache,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import {
  removeContainerById,
  updateContainerById,
} from '../../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig } from '../../types';
import {
  OnUpdateTooltipsOptions,
  TooltipsOptions,
} from '../useTooltipsOptions';

import ContainerTooltip from './ContainerTooltip';
import MultiContainerTooltip from './MultiContainerTooltip';
import useContainerOcrText from './useContainerOcrText';

type UseIndustryCanvasContainerTooltipsProps = {
  selectedContainers: IndustryCanvasContainerConfig[];
  containers: IndustryCanvasContainerConfig[];
  tooltipsOptions: TooltipsOptions;
  onUpdateTooltipsOptions: OnUpdateTooltipsOptions;
  onAddSummarizationSticky: (
    container: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => void;
};

const useIndustryCanvasContainerTooltips = ({
  selectedContainers,
  containers,
  tooltipsOptions,
  onUpdateTooltipsOptions,
  onAddSummarizationSticky,
}: UseIndustryCanvasContainerTooltipsProps): TooltipConfig[] => {
  const [numberOfPages, setNumberOfPages] = useState<number | undefined>(
    undefined
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const selectedContainer =
    selectedContainers.length === 1 ? selectedContainers[0] : undefined;
  const { isInitialLoading: isOcrTextLoading, data: ocrText } =
    useContainerOcrText(selectedContainer);

  useEffect(() => {
    (async () => {
      if (selectedContainer === undefined) {
        return;
      }

      if (selectedContainer.type !== ContainerType.DOCUMENT) {
        return;
      }

      try {
        const numPages = await getPdfCache().getPdfNumPages(
          selectedContainer.url
        );
        setNumberOfPages(numPages);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [selectedContainer]);

  const selectedContainerTooltip = useMemo(() => {
    if (selectedContainer === undefined) {
      return [];
    }

    const tooltipConfigs: TooltipConfig[] = [
      {
        targetIds: [selectedContainer.id],
        content: (
          <ContainerTooltip
            key={selectedContainer.id}
            selectedContainer={selectedContainer}
            containers={containers}
            onAddSummarizationSticky={onAddSummarizationSticky}
            tooltipsOptions={tooltipsOptions}
            onUpdateTooltipsOptions={onUpdateTooltipsOptions}
            onUpdateContainer={(
              containerConfig: IndustryCanvasContainerConfig
            ) =>
              updateContainerById({
                containerId: containerConfig.id,
                containerConfig,
              })
            }
            onRemoveContainer={() => removeContainerById(selectedContainer.id)}
            shamefulNumPages={numberOfPages}
            isLoadingSummary={isLoadingSummary}
            setIsLoadingSummary={setIsLoadingSummary}
            isOcrTextLoading={isOcrTextLoading}
            ocrText={ocrText}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      },
    ];
    return tooltipConfigs;
  }, [
    containers,
    selectedContainer,
    onAddSummarizationSticky,
    numberOfPages,
    isLoadingSummary,
    isOcrTextLoading,
    ocrText,
    tooltipsOptions,
    onUpdateTooltipsOptions,
  ]);

  const multiSelectedContainerTooltip: TooltipConfig[] = useMemo(() => {
    if (selectedContainers.length < 2) {
      return [];
    }

    const haveOnlyAssetsOrEventContainersBeenSelected =
      selectedContainers.every(
        (container) =>
          container.type === ContainerType.ASSET ||
          container.type === ContainerType.EVENT
      );

    if (!haveOnlyAssetsOrEventContainersBeenSelected) {
      return [];
    }

    return [
      {
        targetIds: selectedContainers.map((container) => container.id),
        content: (
          <MultiContainerTooltip selectedContainers={selectedContainers} />
        ),
        anchorTo: TooltipAnchorPosition.TOP_CENTER,
      },
    ];
  }, [selectedContainers]);

  return [...selectedContainerTooltip, ...multiSelectedContainerTooltip];
};

export default useIndustryCanvasContainerTooltips;
