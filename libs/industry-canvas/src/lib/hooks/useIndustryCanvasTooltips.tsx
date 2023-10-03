import { useMemo } from 'react';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { OnAddContainerReferences } from '../IndustryCanvasPage';
import type { Comment } from '../services/comments/types';
import { RootState } from '../state/useIndustrialCanvasStore';
import {
  CanvasAnnotation,
  CommentAnnotation,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
} from '../types';

import useCanvasAnnotationTooltips from './useCanvasAnnotationTooltips';
import useCommentTooltips from './useCommentTooltips';
import useConditionalFormattingTooltips from './useConditionalFormattingTooltips';
import useIndustryCanvasAssetTooltips from './useIndustryCanvasAssetTooltips';
import useIndustryCanvasContainerTooltips from './useIndustryCanvasContainerTooltips';
import useIndustryCanvasFileLinkTooltips from './useIndustryCanvasFileLinkTooltips';
import useLiveSensorValuesTooltips from './useLiveSensorValues';
import { UseOnUpdateSelectedAnnotationReturnType } from './useOnUpdateSelectedAnnotation';
import { OnUpdateTooltipsOptions, TooltipsOptions } from './useTooltipsOptions';

export type UseTooltipsParams = {
  selectedContainers: IndustryCanvasContainerConfig[];
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
  commentAnnotations: CommentAnnotation[];
  comments: Comment[];
  pinnedTimeseriesIdsByAnnotationId: Record<string, number[]>;
  liveSensorRulesByAnnotationIdByTimeseriesId: IndustryCanvasState['liveSensorRulesByAnnotationIdByTimeseriesId'];
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: RootState['isConditionalFormattingOpenAnnotationIdByTimeseriesId'];
} & UseOnUpdateSelectedAnnotationReturnType;

const useIndustryCanvasTooltips = ({
  containers,
  clickedContainerAnnotation,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onAddSummarizationSticky,
  tooltipsOptions,
  onUpdateTooltipsOptions,
  selectedContainers,
  onUpdateSelectedAnnotation,
  comments,
  commentAnnotations,
  pinnedTimeseriesIdsByAnnotationId,
  isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  liveSensorRulesByAnnotationIdByTimeseriesId,
}: UseTooltipsParams) => {
  const assetTooltips = useIndustryCanvasAssetTooltips(
    clickedContainerAnnotation,
    onAddContainerReferences,
    pinnedTimeseriesIdsByAnnotationId
  );
  const fileLinkTooltips = useIndustryCanvasFileLinkTooltips({
    clickedContainerAnnotation,
    onAddContainerReferences,
  });
  const canvasAnnotationTooltips = useCanvasAnnotationTooltips({
    selectedCanvasAnnotation,
    onUpdateSelectedAnnotation,
  });
  const containerTooltips = useIndustryCanvasContainerTooltips({
    selectedContainers,
    containers,
    tooltipsOptions,
    onUpdateTooltipsOptions,
    onAddSummarizationSticky,
  });
  const commentTooltips = useCommentTooltips({
    commentAnnotations,
    comments,
  });
  const liveSensorValuesTooltips = useLiveSensorValuesTooltips({
    timeseriesIdsByAnnotationId: pinnedTimeseriesIdsByAnnotationId,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  });

  const conditionalFormattingTooltips = useConditionalFormattingTooltips({
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    liveSensorRulesByAnnotationIdByTimeseriesId,
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
    liveSensorValuesTooltips,
    conditionalFormattingTooltips,
    containerTooltips,
    assetTooltips,
    canvasAnnotationTooltips,
    fileLinkTooltips,
    commentTooltips,
  ]);
};

export default useIndustryCanvasTooltips;
