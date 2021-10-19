import styled from 'styled-components/macro';

import { NoUnmountShowHideProps } from './NoUnmountShowHide';

export const NoUnmountShowHideContainer = styled.div`
  position: relative;
  ${(props: NoUnmountShowHideProps) => `
    display: ${props.show ? 'initial' : 'none'};
    ${props.fullHeight && 'height: 100%'};
  `}
`;
