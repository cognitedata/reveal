import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Integration } from 'model/Integration';
import { createLink } from '@cognite/cdf-utilities';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { createSearchParams } from 'utils/integrationUtils';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import {
  CDF_LABEL,
  DATA_SETS_LABEL,
  EXTRACTION_PIPELINES_LIST,
} from 'utils/constants';
import { StyledNavLink } from 'styles/StyledLinks';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';

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
    <Breadcrumbs
      breadcrumbs={currentPageBreadCrumbs}
      rightSide={
        <StyledNavLink
          to={{
            pathname: createExtPipePath(),
          }}
        >
          {EXTRACTION_PIPELINES_LIST}
        </StyledNavLink>
      }
    />
  );
};
