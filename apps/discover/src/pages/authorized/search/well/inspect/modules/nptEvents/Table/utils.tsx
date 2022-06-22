import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';

import styled from 'styled-components/macro';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';

import { NptCodeDefinition } from '../components/NptCodeDefinition';
import { NptCodeAvatar } from '../elements';
import { NptCodeDefinitionType, NptView } from '../types';

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
  nptEvent: NptView,
  nptLegendCodes?: NptCodeDefinitionType
) => {
  const { nptCode, nptCodeColor } = nptEvent;

  const nptCodeDefinition = getCodeDefinition(nptCode, nptLegendCodes);

  return (
    <NptCodeContainer>
      <NptCodeAvatar color={nptCodeColor} />
      {nptCode}
      <NptCodeDefinition
        nptCodeDefinition={nptCodeDefinition}
        iconStyle={IconStyles}
      />
    </NptCodeContainer>
  );
};
