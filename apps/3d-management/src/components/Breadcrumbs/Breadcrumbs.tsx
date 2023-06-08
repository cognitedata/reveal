import React from 'react';
import styled from 'styled-components';
import { Breadcrumb } from 'antd';
import Link from '@3d-management/components/Breadcrumbs/Link';
import theme from '@3d-management/styles/theme';

interface BreadcrumbsProps {
  breadcrumbs: { title: string; path?: string }[];
}
const Wrapper = styled.div`
  background: transparent;
  font-size: 16px;
  color: ${theme.breadcrumbsText};
  font-weight: bold;
`;

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => (
  <Wrapper>
    <StyledAntdBreadCrumb
      separator={
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>&gt;</span>
      }
    >
      <Breadcrumb.Item>
        <Link to="/">Cognite Data Fusion</Link>
      </Breadcrumb.Item>
      {breadcrumbs &&
        breadcrumbs.map((crumb) => (
          <Breadcrumb.Item key={crumb.title}>
            {crumb.path ? (
              <Link to={crumb.path}>{crumb.title}</Link>
            ) : (
              crumb.title
            )}
          </Breadcrumb.Item>
        ))}
    </StyledAntdBreadCrumb>
  </Wrapper>
);

export default Breadcrumbs;

export const StyledAntdBreadCrumb = styled(Breadcrumb)`
  ol {
    align-items: center;
  }
`;
