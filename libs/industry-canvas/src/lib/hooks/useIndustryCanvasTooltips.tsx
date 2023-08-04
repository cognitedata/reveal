import { useMemo } from 'react';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { OnOpenConditionalFormattingClick } from '../IndustryCanvas';
import { OnAddContainerReferences } from '../IndustryCanvasPage';
import {
  CanvasAnnotation,
  CommentAnnotation,
  IndustryCanvasContainerConfig,
} from '../types';

import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import useCommentTooltips from './useCommentTooltips';
import useConditionalFormattingTooltips from './useConditionalFormattingTooltips';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import useLiveSensorValuesTooltips from './useLiveSensorValues';
import { UseManagedStateReturnType } from './useManagedState';
import { UseOnUpdateSelectedAnnotationReturnType } from './useOnUpdateSelectedAnnotation';
import { UseResourceSelectorActionsReturnType } from './useResourceSelectorActions';
import { OnUpdateTooltipsOptions, TooltipsOptions } from './useTooltipsOptions';

export type UseTooltipsParams = {
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  containers: IndustryCanvasContainerConfig[];
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
  onResourceSelectorOpen: UseResourceSelectorActionsReturnType['onResourceSelectorOpen'];
  commentAnnotations: CommentAnnotation[];
  pinnedTimeseriesIdsByAnnotationId: Record<string, number[]>;
  onPinTimeseriesClick: UseManagedStateReturnType['onPinTimeseriesClick'];
  onOpenConditionalFormattingClick: OnOpenConditionalFormattingClick;
  liveSensorRulesByAnnotationIdByTimeseriesId: UseManagedStateReturnType['liveSensorRulesByAnnotationIdByTimeseriesId'];
  onLiveSensorRulesChange: UseManagedStateReturnType['onLiveSensorRulesChange'];
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: UseManagedStateReturnType['isConditionalFormattingOpenAnnotationIdByTimeseriesId'];
  onCloseConditionalFormattingClick: UseManagedStateReturnType['onCloseConditionalFormattingClick'];
  onToggleConditionalFormatting: UseManagedStateReturnType['onToggleConditionalFormatting'];
} & UseOnUpdateSelectedAnnotationReturnType;

const useIndustryCanvasTooltips = ({
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
  onUpdateSelectedAnnotation,
  onResourceSelectorOpen,
  commentAnnotations,
  pinnedTimeseriesIdsByAnnotationId,
  onPinTimeseriesClick,
  onOpenConditionalFormattingClick,
  isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  onLiveSensorRulesChange,
  liveSensorRulesByAnnotationIdByTimeseriesId,
  onCloseConditionalFormattingClick,
  onToggleConditionalFormatting,
}: UseTooltipsParams) => {
  const assetTooltips = useIndustryCanvasAssetTooltips(
    clickedContainerAnnotation,
    onAddContainerReferences,
    onResourceSelectorOpen,
    pinnedTimeseriesIdsByAnnotationId,
    onPinTimeseriesClick,
    onOpenConditionalFormattingClick
  );
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    clickedContainerAnnotation,
    onAddContainerReferences,
  });
  const canvasAnnotationTooltips = useCanvasAnnotationTooltips({
    selectedCanvasAnnotation,
    onDeleteSelectedCanvasAnnotation,
    onUpdateSelectedAnnotation,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    selectedContainer,
    containers,
    tooltipsOptions,
    onUpdateTooltipsOptions,
    onAddSummarizationSticky,
    updateContainerById,
    removeContainerById,
    onResourceSelectorOpen,
  });
  const commentTooltips = useCommentTooltips({
    commentAnnotations,
  });
  const liveSensorValuesTooltips = useLiveSensorValuesTooltips({
    timeseriesIdsByAnnotationId: pinnedTimeseriesIdsByAnnotationId,
    onToggleConditionalFormatting,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  });

  const conditionalFormattingTooltips = useConditionalFormattingTooltips({
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    onCloseConditionalFormattingClick,
    liveSensorRulesByAnnotationIdByTimeseriesId,
    onLiveSensorRulesChange,
  });

  return useMemo(() => {
    return [
      ...liveSensorValuesTooltips,
      ...conditionalFormattingTooltips,
      ...containerTooltips,
      ...assetTooltips,
      ...canvasAnnotationTooltips,
      ...fileLinkTooltips,
      ...commentTooltips,
    ];
  }, [
    assetTooltips,
    canvasAnnotationTooltips,
    fileLinkTooltips,
    containerTooltips,
    commentTooltips,
    liveSensorValuesTooltips,
  ]);
};

export default useIndustryCanvasTooltips;
