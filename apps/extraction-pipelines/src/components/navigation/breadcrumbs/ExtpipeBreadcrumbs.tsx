import React, { FunctionComponent, PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

import { useTranslation } from '../../../common';
import { useRunFilterContext } from '../../../hooks/runs/RunsFilterContext';
import { useDataSets } from '../../../hooks/useDataSets';
import { Extpipe } from '../../../model/Extpipe';
import { EXT_PIPE_PATH } from '../../../routing/RoutingConfig';
import { createExtPipePath } from '../../../utils/baseURL';
import { createSearchParams } from '../../../utils/extpipeUtils';

import { Breadcrumbs } from './Breadcrumbs';

interface ExtpipeBreadcrumbsProps {
  extpipe?: Extpipe;
}

export const ExtpipeBreadcrumbs: FunctionComponent<ExtpipeBreadcrumbsProps> = ({
  extpipe,
}: PropsWithChildren<ExtpipeBreadcrumbsProps>) => {
  const { t } = useTranslation();

  const { revision } = useParams<{ revision?: string }>();

  const { data } = useDataSets(
    extpipe?.dataSetId ? [{ id: extpipe?.dataSetId }] : []
  );

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();
  const datasetName = data?.[0]?.name;

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
            label: datasetName || `${extpipe?.dataSetId}`,
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
    ...(revision
      ? [
          {
            label: 'configuration revision',
          },
          {
            label: revision,
            href: createExtPipePath(
              `/${EXT_PIPE_PATH}/${extpipe?.id}/config/${revision}`
            ),
          },
        ]
      : []),
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
