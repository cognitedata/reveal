import { useMemo } from 'react';

import {
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import ConditionalLiveSensorValue from '../components/ContextualTooltips/AssetTooltip/ConditionalLiveSensorValue';

import {
  LiveSensorRulesByAnnotationIdByTimeseriesId,
  OnToggleConditionalFormatting,
} from './useManagedState';
import useTimeseriesLatestValues from './useTimeseriesLatestValue';
import { useTimeseriesPlural } from './useTimeseriesPlural';

const getTimeseriesIdsFlat = (
  timeseriesIdsByAnnotationId: Record<string, number[]>
): number[] => {
  return Object.values(timeseriesIdsByAnnotationId).flat();
};

const useLiveSensorValuesTooltips = ({
  timeseriesIdsByAnnotationId,
  onToggleConditionalFormatting,
  liveSensorRulesByAnnotationIdByTimeseriesId,
}: {
  timeseriesIdsByAnnotationId: Record<string, number[]>;
  onToggleConditionalFormatting: OnToggleConditionalFormatting;
  liveSensorRulesByAnnotationIdByTimeseriesId: LiveSensorRulesByAnnotationIdByTimeseriesId;
}): TooltipConfig[] => {
  const { data: timeseriesByTsId } = useTimeseriesPlural(
    getTimeseriesIdsFlat(timeseriesIdsByAnnotationId)
  );
  const { data: valueByTsId } = useTimeseriesLatestValues(
    getTimeseriesIdsFlat(timeseriesIdsByAnnotationId)
  );

  const liveSensorValueTooltips: TooltipConfig[] = useMemo(() => {
    if (timeseriesByTsId === undefined || valueByTsId === undefined) {
      return [];
    }

    return Object.entries(timeseriesIdsByAnnotationId).flatMap(
      ([annotationId, timeseriesIds]) => {
        return timeseriesIds
          .filter(
            (tsId) =>
              timeseriesByTsId[tsId] !== undefined &&
              valueByTsId[tsId] !== undefined
          )
          .map((tsId) => {
            const unit = timeseriesByTsId[tsId].unit;
            const value = valueByTsId[tsId];

            if (value === undefined) {
              throw new Error(
                `No value found for timeseries ${tsId} in useLiveSensorValuesTooltips`
              );
            }

            return {
              targetId: annotationId,
              anchorTo: TooltipAnchorPosition.TOP_RIGHT,
              content: (
                <ConditionalLiveSensorValue
                  rules={
                    liveSensorRulesByAnnotationIdByTimeseriesId[annotationId]?.[
                      tsId
                    ] ?? []
                  }
                  value={value}
                  unit={unit}
                  onClick={() =>
                    onToggleConditionalFormatting({
                      annotationId,
                      timeseriesId: tsId,
                    })
                  }
                  opaque={false}
                />
              ),
            };
          });
      }
    );
  }, [
    timeseriesByTsId,
    valueByTsId,
    timeseriesIdsByAnnotationId,
    onToggleConditionalFormatting,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  ]);

  return liveSensorValueTooltips;
};

export default useLiveSensorValuesTooltips;
