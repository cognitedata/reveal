import React from 'react';
import styled from 'styled-components';
import Breadcrumb from 'antd/lib/breadcrumb';
import { Colors } from '@cognite/cogs.js';
import Link from 'components/Breadcrumbs/Link';

interface BreadcrumbsProps {
  breadcrumbs: { title: string; path?: string }[];
}
const Wrapper = styled.div`
  background: transparent;
  height: 48px;
  color: ${Colors['greyscale-grey6'].hex()};
  font-weight: 400;
  font-style: 'Inter';
  font-size: 14px;
  background: ${Colors['greyscale-grey1'].hex()};
  padding: 16px 40px;
`;

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => (
  <Wrapper>
    <Breadcrumb
      separator={
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>/</span>
      }
    >
      <Breadcrumb.Item>
        <Link to="/">Cognite Data Fusion</Link>
      </Breadcrumb.Item>
      {breadcrumbs &&
        breadcrumbs.map((crumb) => (
          <Breadcrumb.Item key={crumb.title}>
            {crumb.path ? (
              <Link to={`/${crumb.path}`}>{crumb.title}</Link>
            ) : (
              crumb.title
            )}
          </Breadcrumb.Item>
        ))}
    </Breadcrumb>
  </Wrapper>
);

export default Breadcrumbs;
