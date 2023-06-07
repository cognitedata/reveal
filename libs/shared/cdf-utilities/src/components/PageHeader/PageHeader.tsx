import React from 'react';

import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

import Breadcrumb, { BreadcrumbProps } from '../Breadcrumb/Breadcrumb';

export type PageHeaderProps = {
  breadcrumbItems: BreadcrumbProps['items'];
  className?: string;
  title: string;
};

const PageHeader = ({
  breadcrumbItems,
  className,
  title,
}: PageHeaderProps): JSX.Element => {
  return (
    <StyledPageHeaderContainer className={className}>
      <StyledBreadcrumbWrapper items={breadcrumbItems} />
      <Title level={3}>{title}</Title>
    </StyledPageHeaderContainer>
  );
};

const StyledPageHeaderContainer = styled.div`
  padding: 24px 40px 16px;
  width: 100%;
`;

const StyledBreadcrumbWrapper = styled(Breadcrumb)`
  margin-bottom: 6px;
`;

export default PageHeader;
