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
import { OnUpdateTooltipsOptions, TooltipsOptions } from './useTooltipsOptions';

export type UseTooltipsParams = {
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  containers: IndustryCanvasContainerConfig[];
  containerAnnotations: ExtendedAnnotation[];
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  tooltipsOptions: TooltipsOptions;
  onUpdateTooltipsOptions: OnUpdateTooltipsOptions;
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
  containers,
  clickedContainerAnnotation,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onAddSummarizationSticky,
  onDeleteSelectedCanvasAnnotation,
  tooltipsOptions,
  onUpdateTooltipsOptions,
  selectedContainer,
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
    selectedContainer,
    containers,
    tooltipsOptions,
    onUpdateTooltipsOptions,
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
