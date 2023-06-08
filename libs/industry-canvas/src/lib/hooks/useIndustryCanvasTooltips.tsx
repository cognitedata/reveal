import { useMemo } from 'react';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { OnAddContainerReferences } from '../IndustryCanvasPage';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from '../types';

import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import { UseManagedStateReturnType } from './useManagedState';
import { OnUpdateAnnotationStyleByType } from './useManagedTools';
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
  const containerTooltips = useIndustryCanvasContainerTooltips({
    selectedContainer,
    containers,
    tooltipsOptions,
    onUpdateTooltipsOptions,
    onAddSummarizationSticky,
    updateContainerById,
    removeContainerById,
  });
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

  return useMemo(() => {
    return [
      ...containerTooltips,
      ...assetTooltips,
      ...canvasAnnotationTooltips,
      ...fileLinkTooltips,
    ];
  }, [
    assetTooltips,
    canvasAnnotationTooltips,
    fileLinkTooltips,
    containerTooltips,
  ]);
};

export default useIndustryCanvasTooltips;
