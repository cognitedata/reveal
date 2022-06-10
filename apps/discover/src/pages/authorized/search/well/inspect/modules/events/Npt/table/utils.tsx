import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';

import get from 'lodash/get';
import styled from 'styled-components/macro';
import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { NPTEvent } from 'modules/wellSearch/types';
import { SortBy } from 'pages/types';

import { accessors } from '../constants';
import { NptCodeAvatar } from '../elements';
import { NptCodeDefinition } from '../NptCodeDefinition';
import { NptCodeDefinitionType } from '../types';

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
  nptLegendCodes?: NptCodeDefinitionType
) => {
  const nptCode = get(nptEvent, accessors.NPT_CODE);
  const nptCodeDefinition = getCodeDefinition(nptCode, nptLegendCodes);

  return (
    <NptCodeContainer>
      <NptCodeAvatar color={nptEvent.nptCodeColor} />
      {nptCode}
      <NptCodeDefinition
        nptCodeDefinition={nptCodeDefinition}
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
