import { useMemo } from 'react';

import {
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import ConditionalFormattingTooltip from '../components/ContextualTooltips/AssetTooltip/ConditionalFormattingTooltip';
import {
  closeConditionalFormattingClick,
  onLiveSensorRulesChangeByAnnotationIdByTimeseriesIds,
} from '../state/useIndustrialCanvasStore';

import {
  IsConditionalFormattingOpenByAnnotationIdByTimeseriesId,
  LiveSensorRulesByAnnotationIdByTimeseriesId,
} from './useOnUpdateRequest';

const useConditionalFormattingTooltips = ({
  isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  liveSensorRulesByAnnotationIdByTimeseriesId,
}: {
  liveSensorRulesByAnnotationIdByTimeseriesId: LiveSensorRulesByAnnotationIdByTimeseriesId;
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: IsConditionalFormattingOpenByAnnotationIdByTimeseriesId;
}): TooltipConfig[] => {
  const conditionalFormattingTooltips: TooltipConfig[] = useMemo(() => {
    return Object.entries(
      isConditionalFormattingOpenAnnotationIdByTimeseriesId
    ).flatMap(([annotationId, isOpenByTimeseriesId]) =>
      Object.entries(isOpenByTimeseriesId)
        .filter(([, isOpen]) => isOpen)
        .flatMap(([timeseriesId]) => ({
          targetId: annotationId,
          anchorTo: TooltipAnchorPosition.TOP_LEFT,
          shouldPositionStrictly: true,
          content: (
            <ConditionalFormattingTooltip
              id={Number(timeseriesId)}
              onSaveClick={(nextRules) => {
                onLiveSensorRulesChangeByAnnotationIdByTimeseriesIds({
                  annotationId,
                  timeseriesId: Number(timeseriesId),
                  rules: nextRules,
                });

                closeConditionalFormattingClick();
              }}
              initialRules={
                liveSensorRulesByAnnotationIdByTimeseriesId[annotationId]?.[
                  Number(timeseriesId)
                ] ?? []
              }
              onBackClick={closeConditionalFormattingClick}
            />
          ),
        }))
    );
  }, [
    liveSensorRulesByAnnotationIdByTimeseriesId,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  ]);

  return conditionalFormattingTooltips;
};

export default useConditionalFormattingTooltips;
