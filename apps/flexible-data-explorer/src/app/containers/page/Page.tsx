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
  position: relative;
  overflow: auto;
  height: 100%;
  background-color: var(--default-bg-color);
`;
