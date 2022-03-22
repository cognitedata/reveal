import React from 'react';
import styled from 'styled-components';
import Breadcrumb from 'antd/lib/breadcrumb';
import Link from 'components/Link';
import theme from 'styles/theme';

interface BreadcrumbsProps {
  breadcrumbs: { title: string; path?: string }[];
}
const Wrapper = styled.div`
  background: transparent;
  height: 40px;
  margin-bottom: 20px;
  font-size: 16px;
  color: ${theme.breadcrumbsText};
  font-weight: bold;
`;

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => (
  <Wrapper>
    <Breadcrumb
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
    </Breadcrumb>
  </Wrapper>
);

export default Breadcrumbs;
