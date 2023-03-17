import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import { OnAddContainerReferences } from './useIndustryCanvasAddContainerReferences';
import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceWithoutDimensions,
} from '../types';
import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import { ShapeAnnotationTooltipProps } from '../components/ShapeAnnotationTooltip';

export type UseTooltipsParams = {
  containerAnnotations: ExtendedAnnotation[];
  selectedContainerAnnotation: ExtendedAnnotation | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  clickedContainer: ContainerReference | undefined;
  onAddContainerReferences: OnAddContainerReferences;
  removeContainerReference: (containerReference: ContainerReference) => void;
  containerReferences: ContainerReference[];
  updateContainerReference: (
    containerReference: ContainerReferenceWithoutDimensions
  ) => void;
} & ShapeAnnotationTooltipProps;

const useIndustryCanvasTooltips = ({
  containerAnnotations,
  selectedContainerAnnotation,
  selectedCanvasAnnotation,
  clickedContainer,
  onAddContainerReferences,
  removeContainerReference,
  containerReferences,
  onDeleteSelectedCanvasAnnotation,
  shapeAnnotationStyle,
  onUpdateShapeAnnotationStyle,
  updateContainerReference,
}: UseTooltipsParams) => {
  const assetTooltips = useIndustryCanvasAssetTooltips(
    selectedContainerAnnotation
  );
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    annotations: containerAnnotations,
    selectedAnnotation: selectedContainerAnnotation,
    onAddContainerReferences,
    containerReferences,
  });
  const canvasAnnotationTooltips = useCanvasAnnotationTooltips({
    selectedCanvasAnnotation,
    onDeleteSelectedCanvasAnnotation,
    shapeAnnotationStyle,
    onUpdateShapeAnnotationStyle,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    clickedContainer,
    removeContainerReference,
    updateContainerReference,
  });

  return useMemo(() => {
    return [
      ...assetTooltips,
      ...canvasAnnotationTooltips,
      ...fileLinkTooltips,
      ...containerTooltips,
    ];
  }, [
    assetTooltips,
    canvasAnnotationTooltips,
    fileLinkTooltips,
    containerTooltips,
  ]);
};

export default useIndustryCanvasTooltips;
