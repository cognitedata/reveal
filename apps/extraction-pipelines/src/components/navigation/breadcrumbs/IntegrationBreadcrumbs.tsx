import React, { FunctionComponent, PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Integration } from 'model/Integration';
import { createLink } from '@cognite/cdf-utilities';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { createSearchParams } from 'utils/integrationUtils';
import { Colors } from '@cognite/cogs.js';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import {
  CDF_LABEL,
  DATA_SETS_LABEL,
  EXTRACTION_PIPELINES_OVERVIEW,
} from 'utils/constants';
import { StyledNavLink } from 'styles/StyledLinks';

const BreadcrumbsWrapper = styled.nav`
  grid-area: breadcrumbs;
  padding: 0.875rem 2rem;
  display: flex;
  justify-content: space-between;
  ol {
    margin: 0;
    padding-left: 0;
    list-style: none;
    li {
      display: inline;
      + li::before {
        display: inline-block;
        margin: 0 0.1rem 0 0.3rem;
        color: ${Colors['greyscale-grey6'].hex()};
        content: '/\\00a0';
      }
      a {
        color: ${Colors['greyscale-grey6'].hex()};
        &:hover {
          text-decoration: underline;
        }
        &.active {
          color: ${Colors['greyscale-grey10'].hex()};
        }
      }
    }
  }
`;
interface IntegrationBreadcrumbsProps {
  integration?: Integration;
}

export const IntegrationBreadcrumbs: FunctionComponent<IntegrationBreadcrumbsProps> = ({
  integration,
}: PropsWithChildren<IntegrationBreadcrumbsProps>) => {
  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const currentPageBreadCrumbs = [
    { href: createLink(''), label: CDF_LABEL },
    {
      href: createLink('/data-sets'),
      label: DATA_SETS_LABEL,
    },
    ...(integration?.dataSetId
      ? [
          {
            href: createLink(`/data-sets/data-set/${integration?.dataSetId}`),
            label: integration?.dataSet?.name,
          },
        ]
      : []),
    ...(integration?.dataSetId
      ? [
          {
            href: createExtPipePath(`/${EXT_PIPE_PATH}/${integration?.id}`),
            params: createSearchParams({ search, statuses, dateRange }),
            label: integration?.name,
          },
        ]
      : []),
  ];
  return (
    <BreadcrumbsWrapper aria-label="Breadcrumb">
      <ol>
        {currentPageBreadCrumbs.map(({ href, label, params }) => {
          return (
            <li key={href}>
              <NavLink
                to={{
                  pathname: href,
                  search: params,
                }}
                isActive={(match, linkLoc) => {
                  return href.includes(linkLoc.pathname);
                }}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ol>
      <StyledNavLink
        to={{
          pathname: createExtPipePath(),
        }}
      >
        {EXTRACTION_PIPELINES_OVERVIEW}
      </StyledNavLink>
    </BreadcrumbsWrapper>
  );
};
