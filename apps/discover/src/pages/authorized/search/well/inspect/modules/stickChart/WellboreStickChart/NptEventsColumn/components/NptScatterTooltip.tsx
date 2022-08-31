import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import { getDateOrDefaultText } from 'utils/date';

import { DepthMeasurementUnit } from 'constants/units';
import { FlexRowFullWidth } from 'styles/layout';

import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';
import { DetailCardWrapper } from '../elements';

import { DetailCardBlock } from './DetailCardBlock';
import { NptCodeDataBlock } from './NptCodeDataBlock';

export interface NptScatterTooltipProps {
  event: NptInternalWithTvd;
  nptCodeDefinitions: NptCodeDefinitionType;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NptScatterTooltip: React.FC<NptScatterTooltipProps> = ({
  event,
  nptCodeDefinitions,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}) => {
  const {
    nptCode,
    nptCodeDetail,
    nptCodeColor,
    startTime,
    endTime,
    duration,
    measuredDepth,
    trueVerticalDepth,
  } = event;

  const nptCodeDefinition = nptCode && nptCodeDefinitions[nptCode];

  const depth = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD && measuredDepth) {
      return measuredDepth;
    }
    if (
      depthMeasurementType === DepthMeasurementUnit.TVD &&
      trueVerticalDepth
    ) {
      return trueVerticalDepth;
    }
    return null;
  }, [measuredDepth?.value, trueVerticalDepth?.value]);

  return (
    <DetailCardWrapper>
      <FlexRowFullWidth>
        <NptCodeDataBlock
          nptCode={nptCode}
          nptCodeDetail={nptCodeDetail}
          nptCodeColor={nptCodeColor}
          nptCodeDefinition={nptCodeDefinition}
        />
        <DetailCardBlock
          title={`Depth ${depth && `(${depth.unit})`}`}
          value={depth?.value}
        />
      </FlexRowFullWidth>

      <FlexRowFullWidth>
        <DetailCardBlock
          title="Start date"
          value={getDateOrDefaultText(startTime)}
        />
        <DetailCardBlock
          title="End date"
          value={getDateOrDefaultText(endTime)}
        />
        <DetailCardBlock title="Duration (hrs)" value={duration} />
      </FlexRowFullWidth>
    </DetailCardWrapper>
  );
};
