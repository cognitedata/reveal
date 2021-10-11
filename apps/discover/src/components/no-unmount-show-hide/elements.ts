import styled from 'styled-components/macro';

import { NoUnmountShowHideProps } from './NoUnmountShowHide';

export const NoUnmountShowHideContainer = styled.div`
  position: relative;
  display: ${(props: NoUnmountShowHideProps) =>
    props.show ? 'initial' : 'none'};
`;
