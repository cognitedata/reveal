import { Controls, ControlButton } from 'react-flow-renderer';

import styled from 'styled-components/macro';

export const CustomControlButtonGroup = styled(Controls)`
  && {
    border-radius: 6px;

    .tippy-arrow {
      color: #ffffff !important;
    }
  }
`;
export const CustomControlButton = styled(ControlButton)`
  && {
    box-sizing: content-box; //added for fusion, will not impact legacy
    width: 22px;
    height: 22px;

    &:first-child {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    &:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }
`;
