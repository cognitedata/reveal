import React, { ReactNode } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Breadcrumb, PageTitle } from '..';

interface SubAppWrapperProps {
  title: string;
  breadcrumbItems?: { title: string; path: string }[];
  children: ReactNode;
}

const SubAppWrapper = ({
  title,
  children,
  breadcrumbItems,
}: SubAppWrapperProps) => {
  return (
    <>
      <PageTitle title={title} />
      <StyledWrapper>
        {breadcrumbItems ? <StyledBreadcrumb items={breadcrumbItems} /> : null}
        {children}
      </StyledWrapper>
    </>
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
