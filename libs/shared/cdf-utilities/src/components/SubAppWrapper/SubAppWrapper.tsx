import { ReactNode } from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { getCluster, getProject } from '../../utils';
import { useUserInformation } from '../../utils/hooks';
import { Breadcrumb } from '../Breadcrumb';
import PageTitle from '../PageTitle/PageTitle';

import { SubAppProvider } from './context';

interface SubAppWrapperProps {
  title?: string;
  breadcrumbItems?: { title: string; path: string }[];
  children: ReactNode;
  userId?: string;
}

const SubAppWrapper = ({
  title,
  children,
  breadcrumbItems,
  userId,
}: SubAppWrapperProps) => {
  const cluster = getCluster() || '';
  const project = getProject();
  const { data: user } = useUserInformation();

  return (
    <SubAppProvider user={{ cluster, project, id: userId || user?.id || '' }}>
      <PageTitle title={title} />
      <StyledWrapper>
        {breadcrumbItems ? <StyledBreadcrumb items={breadcrumbItems} /> : null}
        {children}
      </StyledWrapper>
    </SubAppProvider>
  );
};

export default SubAppWrapper;

const StyledWrapper = styled.div`
  position: fixed;
  top: var(--cdf-ui-navigation-height);
  height: calc(100vh - var(--cdf-ui-navigation-height));
  width: 100%;
  overflow: auto;
  background-color: #ffffff;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  border-bottom: 1px solid ${Colors['border--muted']};
  padding: 14px 42px;
`;
