import styled from 'styled-components/macro';

import { DURATION } from 'styles/transition';

import {
  BodyColumn,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';

export const BodyColumnWrapper = styled(BodyColumn)`
  transition: min-width ${DURATION.FAST};
`;

export const ExpandableColumnHeaderWrapper = styled(ColumnHeaderWrapper)`
  padding-right: 2px;

  button {
    margin-top: -6px;
    background: transparent !important;
  }
`;
