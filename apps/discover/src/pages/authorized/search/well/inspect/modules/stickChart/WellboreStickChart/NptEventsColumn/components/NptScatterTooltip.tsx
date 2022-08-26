import {
  NptCodeDefinitionType,
  NptInternal,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { getDateOrDefaultText } from 'utils/date';

import { FlexRowFullWidth } from 'styles/layout';

import { DetailCardWrapper } from '../elements';

import { DetailCardBlock } from './DetailCardBlock';
import { NptCodeDataBlock } from './NptCodeDataBlock';

export interface NptScatterTooltipProps {
  event: NptInternal;
  nptCodeDefinitions: NptCodeDefinitionType;
}

export const NptScatterTooltip: React.FC<NptScatterTooltipProps> = ({
  event,
  nptCodeDefinitions,
}) => {
  const {
    nptCode,
    nptCodeDetail,
    nptCodeColor,
    startTime,
    endTime,
    duration,
    measuredDepth,
  } = event;

  const nptCodeDefinition = nptCode && nptCodeDefinitions[nptCode];

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
          title={`Depth ${measuredDepth && `(${measuredDepth.unit})`}`}
          value={measuredDepth?.value}
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
