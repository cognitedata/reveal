import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import { getDateOrDefaultText } from 'utils/date';

import { DepthMeasurementUnit } from 'constants/units';
import { FlexRowFullWidth } from 'styles/layout';

import { NptCodeDefinition } from '../../../../nptEvents/components/NptCodeDefinition';
import { DetailCardBlock } from '../../../components/DetailCard';

export interface NptEventDetailCardContentProps {
  event: NptInternalWithTvd;
  nptCodeDefinitions: NptCodeDefinitionType;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NptEventDetailCardContent: React.FC<
  NptEventDetailCardContentProps
> = ({ event, nptCodeDefinitions, depthMeasurementType }) => {
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
    <>
      <FlexRowFullWidth>
        <DetailCardBlock
          extended
          title={nptCode}
          value={nptCodeDetail}
          avatarColor={nptCodeColor}
          info={<NptCodeDefinition nptCodeDefinition={nptCodeDefinition} />}
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
    </>
  );
};
