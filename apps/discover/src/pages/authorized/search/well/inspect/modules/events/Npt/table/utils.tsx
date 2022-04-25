import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import styled from 'styled-components/macro';
import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { WellEventLegend } from '@cognite/discover-api-types';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { NPTEvent } from 'modules/wellSearch/types';
import { SortBy } from 'pages/types';

import { accessors, colors, DEFAULT_NPT_COLOR } from '../constants';
import { NptCodeAvatar } from '../elements';
import { NptCodeDefinition } from '../NptCodeDefinition';

import { Body, IconStyles, NptCodeContainer } from './elements';

const TextBodyStrong = styled(Body).attrs({ level: '2', strong: true })`
  max-width: 80%;
`;

export const renderAsBody2DefaultStrongText = (text: string) => (
  <TextBodyStrong>
    <MiddleEllipsis value={text} />
  </TextBodyStrong>
);

export const renderNPTCodeWithColor = (
  nptEvent: NPTEvent,
  nptLegendCodes?: WellEventLegend[]
) => {
  const nptCode = get(nptEvent, accessors.NPT_CODE);
  const nptLegendCode = nptLegendCodes?.find((item) =>
    isEqual(item.id, nptEvent.nptCode)
  );

  return (
    <NptCodeContainer>
      <NptCodeAvatar color={get(colors, nptCode, DEFAULT_NPT_COLOR)} />
      {nptCode}
      <NptCodeDefinition
        nptCodeDefinition={nptLegendCode?.legend}
        iconStyle={IconStyles}
      />
    </NptCodeContainer>
  );
};

export const sortEvents = (events: NPTEvent[], sortBy: SortBy[]) => {
  const { id: accessor, desc } = sortBy[0];

  if (desc) {
    return sortObjectsDecending<NPTEvent>(events, accessor as keyof NPTEvent);
  }

  return sortObjectsAscending<NPTEvent>(events, accessor as keyof NPTEvent);
};
