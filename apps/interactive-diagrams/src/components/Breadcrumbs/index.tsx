import React from 'react';

import styled from 'styled-components';

import Breadcrumb from 'antd/lib/breadcrumb';

import { Colors } from '@cognite/cogs.js';

import { PNID_METRICS, trackUsage } from '../../utils/Metrics';

import Link from './Link';

interface BreadcrumbsProps {
  breadcrumbs: { title: string; path?: string }[];
}
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 48px;
  padding: 16px 40px;
  background: ${Colors['decorative--grayscale--100']};
  color: ${Colors['decorative--grayscale--600']};
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
  font-weight: 400;
  font-style: 'Inter';
  font-size: 14px;
`;

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => (
  <Wrapper>
    <Breadcrumb separator={<span>/</span>}>
      <Breadcrumb.Item
        onClick={() =>
          trackUsage(PNID_METRICS.navigation.breadcrumbs, {
            to: 'Cognite data fusion',
          })
        }
      >
        <Link to="/">CDF</Link>
      </Breadcrumb.Item>
      {breadcrumbs &&
        breadcrumbs.map((crumb) => (
          <Breadcrumb.Item
            key={crumb.title}
            onClick={() =>
              trackUsage(PNID_METRICS.navigation.breadcrumbs, {
                to: crumb.title,
              })
            }
            data-testid="breadcrumb-item"
          >
            {crumb.path ? (
              <Link to={`${crumb.path}`}>{crumb.title}</Link>
            ) : (
              crumb.title
            )}
          </Breadcrumb.Item>
        ))}
    </Breadcrumb>
  </Wrapper>
);

export default Breadcrumbs;
