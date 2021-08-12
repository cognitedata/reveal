import styled from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';
import React from 'react';
import {
  mainContentSpaceAround,
  pageDividerBorder,
  mainContentSpaceSides,
} from 'styles/StyledVariables';
import { StyledRouterLink } from 'components/integrations/cols/Name';
import { MainFullWidthGrid, Span3 } from 'styles/grid/StyledGrid';

export const PageWrapper = styled.div`
  flex: 1;
  height: 100%;
  background-color: ${Colors.white.hex()};
  display: grid;
  grid-template-areas:
    'breadcrumbs breadcrumbs'
    'title links'
    'main main';
  grid-template-rows: min-content min-content;
  .heading {
    grid-area: title;
  }
  h1 {
    grid-area: title;
    margin: 1.5rem 0 1.5rem 2rem;
    align-self: center;
  }
`;

export const GridBreadCrumbsWrapper = styled(StyledRouterLink)`
  grid-area: breadcrumbs;
  margin: 0.5rem 0 0 2rem;
`;

export const BackWrapper = styled(StyledRouterLink)`
  grid-area: back;
  display: flex;
  align-items: center;
  text-decoration: underline;
`;

export const GridH2Wrapper = styled((props) => (
  <Title {...props} level={2}>
    {props.children}
  </Title>
))`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
`;

export const MainWithAsidesWrapper = styled(MainFullWidthGrid)`
  grid-area: main;
  padding: ${mainContentSpaceAround};
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: min-content min-content min-content auto;
  grid-row-gap: 1rem;
  overflow-y: auto;
  height: calc(100vh - 16.375rem);
  @media screen and (min-width: 1400px) {
    grid-template-columns: 2fr 4fr 2fr;
  }
  form,
  h2,
  .data-set-info {
    grid-column: 2 / span 1;
  }
  aside {
    grid-column: 1;
    grid-row: 1 / span 2;
  }
`;

export const SideInfo = styled.aside`
  padding: 1rem 1rem 1rem 0;
  border-right: ${pageDividerBorder};
  margin-right: 2rem;
`;

export const PageWrapperColumn = styled.div`
  ${Span3};
  overflow-y: auto;
  height: calc(100vh - 15rem);
  display: flex;
  flex-direction: column;
  padding: 0 ${mainContentSpaceSides};
  scroll-behavior: smooth;
`;
