import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { PageBody } from './components/PageBody';
import { PageDashboard } from './components/PageDashboard';
import { PageHeader } from './components/PageHeader';
import { PageWidgets } from './components/PageWidgets';

export const Page = ({
  children,
  disableScrollbarGutter,
}: PropsWithChildren<{ disableScrollbarGutter?: boolean }>) => {
  return (
    <PageContainer $disableScrollbarGutter={disableScrollbarGutter}>
      {children}
    </PageContainer>
  );
};

Page.Header = PageHeader;
Page.Body = PageBody;

Page.Dashboard = PageDashboard;
Page.Widgets = PageWidgets;

const PageContainer = styled.div<{ $disableScrollbarGutter?: boolean }>`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
  height: calc(100% - var(--top-bar-height));
  background-color: var(--default-bg-color);
  ${({ $disableScrollbarGutter }) => {
    if (!$disableScrollbarGutter) {
      return css`
        scrollbar-gutter: stable both-edges;
      `;
    }
  }};
`;
