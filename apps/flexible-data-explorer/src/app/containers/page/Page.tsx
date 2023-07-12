import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { PageBody } from './components/PageBody';
import { PageDashboard } from './components/PageDashboard';
import { PageHeader } from './components/PageHeader';
import { PageWidgets } from './components/PageWidgets';

export const Page = ({ children }: PropsWithChildren) => {
  return <PageContainer>{children}</PageContainer>;
};

Page.Header = PageHeader;
Page.Body = PageBody;

Page.Dashboard = PageDashboard;
Page.Widgets = PageWidgets;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
  height: calc(100% - var(--top-bar-height));
  background-color: var(--default-bg-color);
  scrollbar-gutter: stable both-edges;
`;
