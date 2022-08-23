import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Extpipe } from 'model/Extpipe';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { createSearchParams } from 'utils/extpipeUtils';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

interface ExtpipeBreadcrumbsProps {
  extpipe?: Extpipe;
}

export const ExtpipeBreadcrumbs: FunctionComponent<ExtpipeBreadcrumbsProps> = ({
  extpipe,
}: PropsWithChildren<ExtpipeBreadcrumbsProps>) => {
  const { t } = useTranslation();
  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const currentPageBreadCrumbs = [
    {
      href: createLink(''),
      label: t('cognite-data-fusion'),
      dataTestId: 'cognite-data-fusion',
    },
    {
      href: createLink('/data-sets'),
      label: t('data-sets'),
      dataTestId: 'data-sets',
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
