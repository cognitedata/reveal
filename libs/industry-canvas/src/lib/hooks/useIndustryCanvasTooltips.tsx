import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import { OnAddContainerReferences } from './useIndustryCanvasAddContainerReferences';
import {
  ContainerReference,
  ContainerReferenceWithoutDimensions,
} from '../types';

export type UseTooltipsParams = {
  annotations: ExtendedAnnotation[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  clickedContainer: ContainerReference | undefined;
  onAddContainerReferences: OnAddContainerReferences;
  removeContainerReference: (containerReference: ContainerReference) => void;
  containerReferences: ContainerReference[];
  updateContainerReference: (
    containerReference: ContainerReferenceWithoutDimensions
  ) => void;
};

const useIndustryCanvasTooltips = ({
  annotations,
  selectedAnnotation,
  clickedContainer,
  onAddContainerReferences,
  removeContainerReference,
  containerReferences,
  updateContainerReference,
}: UseTooltipsParams) => {
  const hoverTooltips = useIndustryCanvasAssetTooltips(selectedAnnotation);
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    annotations,
    selectedAnnotation,
    onAddContainerReferences,
    containerReferences,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    clickedContainer,
    removeContainerReference,
    updateContainerReference,
  });

  return useMemo(() => {
    return [...hoverTooltips, ...fileLinkTooltips, ...containerTooltips];
  }, [hoverTooltips, fileLinkTooltips, containerTooltips]);
};

export default useIndustryCanvasTooltips;
