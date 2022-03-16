import styled from 'styled-components/macro';

import { NoUnmountShowHideProps } from './NoUnmountShowHide';

export const NoUnmountShowHideContainer = styled.div`
  overflow: auto;
  position: relative;
  visibility: hidden;
  ${(props: NoUnmountShowHideProps) => `
    ${props.show ? 'visibility: visible' : 'max-height: 0'};
    ${props.fullHeight && 'height: 100%'};
  `}
`;
