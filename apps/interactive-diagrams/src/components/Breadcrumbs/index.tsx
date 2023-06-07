import React from 'react';
import styled from 'styled-components';
import Breadcrumb from 'antd/lib/breadcrumb';
import { Colors } from '@cognite/cogs.js';
import Link from 'components/Breadcrumbs/Link';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';

interface BreadcrumbsProps {
  breadcrumbs: { title: string; path?: string }[];
}
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 48px;
  padding: 16px 40px;
  background: ${Colors['greyscale-grey1'].hex()};
  color: ${Colors['greyscale-grey6'].hex()};
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
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
