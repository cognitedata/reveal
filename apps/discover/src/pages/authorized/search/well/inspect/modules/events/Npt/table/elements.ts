import styled from 'styled-components/macro';

import { Body as CogsBody } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const WellNptEventsTableWrapper = styled(FlexColumn)`
  height: 100%;
  td:empty {
    color: var(--cogs-greyscale-grey5);

    &:after {
      content: '\u2014';
    }
  }
`;

export const WellboreNptEventsTableWrapper = styled.div`
  thead {
    display: none;
  }
  td {
    width: 150px;
    padding: 0px 12px !important;
  }
  td:first-child {
    width: 70px;
    padding-left: 0px !important;

    & span {
      margin-left: 50px;
    }
  }
  td:nth-child(2) {
    width: 260px;
  }
  tr:last-child {
    border-bottom: none;
  }
`;

export const NptEventsTableWrapper = styled.div`
  p {
    margin-top: -2px !important;
  }
  td:first-child {
    padding-left: 82px !important;
    width: 330px;
  }
  td:nth-child(2) {
    width: 150px;
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
