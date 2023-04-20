import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from '../types';
import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import { OnUpdateAnnotationStyleByType } from './useManagedTools';
import { UseManagedStateReturnType } from './useManagedState';

export type UseTooltipsParams = {
  clickedContainer: IndustryCanvasContainerConfig | undefined;
  containerAnnotations: ExtendedAnnotation[];
  selectedContainerAnnotation: ExtendedAnnotation | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onAddContainerReferences: UseManagedStateReturnType['addContainerReferences'];
  updateContainerById: UseManagedStateReturnType['updateContainerById'];
  removeContainerById: UseManagedStateReturnType['removeContainerById'];
  onDeleteSelectedCanvasAnnotation: () => void;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
};

const useIndustryCanvasTooltips = ({
  containerAnnotations,
  selectedContainerAnnotation,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onDeleteSelectedCanvasAnnotation,
  clickedContainer,
  updateContainerById,
  removeContainerById,
  onUpdateAnnotationStyleByType,
}: UseTooltipsParams) => {
  const assetTooltips = useIndustryCanvasAssetTooltips(
    selectedContainerAnnotation,
    onAddContainerReferences
  );
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    annotations: containerAnnotations,
    selectedAnnotation: selectedContainerAnnotation,
    onAddContainerReferences,
  });
  const canvasAnnotationTooltips = useCanvasAnnotationTooltips({
    selectedCanvasAnnotation,
    onDeleteSelectedCanvasAnnotation,
    onUpdateAnnotationStyleByType,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    clickedContainer,
    updateContainerById,
    removeContainerById,
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
