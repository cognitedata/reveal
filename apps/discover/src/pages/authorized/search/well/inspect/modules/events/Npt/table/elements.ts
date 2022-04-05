import styled from 'styled-components/macro';

import { Body as CogsBody } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const WellNptEventsTableWrapper = styled(FlexColumn)`
  height: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  div[role='row']:empty {
    color: var(--cogs-bg-control--disabled-hover);

    &:after {
      content: '\u2014';
    }
  }
`;

export const Body = styled(CogsBody)`
  padding-top: ${sizes.normal};
  padding-bottom: ${sizes.normal};
`;

export const NptCodeContainer = styled(FlexRow)`
  margin-top: ${sizes.extraSmall};
  align-items: center;
`;
