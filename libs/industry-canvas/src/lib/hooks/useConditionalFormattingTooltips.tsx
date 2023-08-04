import { useMemo } from 'react';

import {
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import ConditionalFormattingTooltip from '../components/ContextualTooltips/AssetTooltip/ConditionalFormattingTooltip';

import {
  IsConditionalFormattingOpenByAnnotationIdByTimeseriesId,
  LiveSensorRulesByAnnotationIdByTimeseriesId,
  OnCloseConditionalFormattingClick,
  OnLiveSensorRulesChange,
} from './useManagedState';

const useConditionalFormattingTooltips = ({
  isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  liveSensorRulesByAnnotationIdByTimeseriesId,
  onLiveSensorRulesChange,
  onCloseConditionalFormattingClick,
}: {
  liveSensorRulesByAnnotationIdByTimeseriesId: LiveSensorRulesByAnnotationIdByTimeseriesId;
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: IsConditionalFormattingOpenByAnnotationIdByTimeseriesId;
  onLiveSensorRulesChange: OnLiveSensorRulesChange;
  onCloseConditionalFormattingClick: OnCloseConditionalFormattingClick;
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
                onLiveSensorRulesChange({
                  annotationId,
                  timeseriesId: Number(timeseriesId),
                  rules: nextRules,
                });

                onCloseConditionalFormattingClick();
              }}
              initialRules={
                liveSensorRulesByAnnotationIdByTimeseriesId[annotationId]?.[
                  Number(timeseriesId)
                ] ?? []
              }
              onBackClick={onCloseConditionalFormattingClick}
            />
          ),
        }))
    );
  }, [
    liveSensorRulesByAnnotationIdByTimeseriesId,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    onCloseConditionalFormattingClick,
    onLiveSensorRulesChange,
  ]);

  return conditionalFormattingTooltips;
};

export default useConditionalFormattingTooltips;
