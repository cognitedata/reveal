import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from '../types';
import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import { OnUpdateAnnotationStyleByType } from './useManagedTools';
import { UseManagedStateReturnType } from './useManagedState';
import { OnAddContainerReferences } from '../IndustryCanvasPage';

export type UseTooltipsParams = {
  clickedContainer: IndustryCanvasContainerConfig | undefined;
  containerAnnotations: ExtendedAnnotation[];
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onAddContainerReferences: OnAddContainerReferences;
  onAddSummarizationSticky: (
    container: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => void;
  updateContainerById: UseManagedStateReturnType['updateContainerById'];
  removeContainerById: UseManagedStateReturnType['removeContainerById'];
  onDeleteSelectedCanvasAnnotation: () => void;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
};

const useIndustryCanvasTooltips = ({
  containerAnnotations,
  clickedContainerAnnotation,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onAddSummarizationSticky,
  onDeleteSelectedCanvasAnnotation,
  clickedContainer,
  updateContainerById,
  removeContainerById,
  onUpdateAnnotationStyleByType,
}: UseTooltipsParams) => {
  const assetTooltips = useIndustryCanvasAssetTooltips(
    clickedContainerAnnotation,
    onAddContainerReferences
  );
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    annotations: containerAnnotations,
    selectedAnnotation: clickedContainerAnnotation,
    onAddContainerReferences,
  });
  const canvasAnnotationTooltips = useCanvasAnnotationTooltips({
    selectedCanvasAnnotation,
    onDeleteSelectedCanvasAnnotation,
    onUpdateAnnotationStyleByType,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    clickedContainer,
    onAddSummarizationSticky,
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
