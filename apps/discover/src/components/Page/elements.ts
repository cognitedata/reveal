import styled, { css } from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexColumn } from 'styles/layout';

export const PageWrapper = styled(FlexColumn)`
  align-self: stretch;
  min-height: 100vh;
  overflow: auto;
  height: 100vh;

  ${(props: { scrollPage: boolean }) =>
    !props.scrollPage &&
    css`
      flex: 1;
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
    `}
`;

export const TopbarContainer = styled.div`
  position: sticky;
  z-index: ${layers.TOP_BAR};
`;

export const HeaderContainer = styled.div`
  z-index: ${layers.PAGE_HEADER};
`;

export const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  ${(props: { scrollPage: boolean }) =>
    !props.scrollPage &&
    css`
      overflow: hidden;
    `}
`;
