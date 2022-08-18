import styled from 'styled-components/macro';

import { NoUnmountShowHideProps } from './NoUnmountShowHide';

export const NoUnmountShowHideContainer = styled.span`
  ${(props: NoUnmountShowHideProps) =>
    props.show
      ? `
    display: contents;
    visibility: visible;
  `
      : `
    visibility: hidden;
    height: 0;
    width: 0;
  `};
`;
