import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/MiddleEllipsis';

const TextBodyStrong = styled(Body).attrs({ level: '2', strong: true })`
  max-width: 80%;
`;

export const Body2DefaultStrong = (text: string) => (
  <TextBodyStrong>
    <MiddleEllipsis value={text} />
  </TextBodyStrong>
);
