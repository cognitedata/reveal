import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Extpipe } from 'model/Extpipe';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { createSearchParams } from 'utils/extpipeUtils';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { CDF_LABEL, DATA_SETS_LABEL } from 'utils/constants';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';
import { createLink } from '@cognite/cdf-utilities';

interface ExtpipeBreadcrumbsProps {
  extpipe?: Extpipe;
}

export const ExtpipeBreadcrumbs: FunctionComponent<ExtpipeBreadcrumbsProps> = ({
  extpipe,
}: PropsWithChildren<ExtpipeBreadcrumbsProps>) => {
  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const currentPageBreadCrumbs = [
    { href: createLink(''), label: CDF_LABEL },
    {
      href: createLink('/data-sets'),
      label: DATA_SETS_LABEL,
    },
    ...(extpipe?.dataSetId
      ? [
          {
            href: createLink(`/data-sets/data-set/${extpipe?.dataSetId}`),
            label: extpipe?.dataSet?.name,
          },
        ]
      : []),
    ...(extpipe?.dataSetId
      ? [
          {
            href: createExtPipePath(`/${EXT_PIPE_PATH}/${extpipe?.id}`),
            params: createSearchParams({ search, statuses, dateRange }),
            label: extpipe?.name,
          },
        ]
      : []),
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
