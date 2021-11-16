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

export const WellboreNptEventsTableWrapper = styled.div`
  & > * {
    overflow-x: hidden !important;
    width: 100% !important;
  }

  .cogs-body-2 {
    margin-left: ${sizes.large};
  }

  div[role='cell']:first-child span {
    margin-left: ${sizes.large};
  }

  div[role='row']:last-child {
    border-bottom: none;
  }
`;

export const NptEventsTableWrapper = styled.div`
  div[role='cell']:first-child {
    padding-left: 82px;
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
