import React from 'react';
import {
  CDF_LABEL,
  DATA_SETS_LABEL,
  EXTRACTION_PIPELINES,
} from 'utils/constants';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';
import { createExtPipePath } from 'utils/baseURL';
import { createRedirectLink } from 'utils/utils';

export const ExtPipesBreadcrumbs = () => {
  const currentPageBreadCrumbs = [
    { href: createRedirectLink(''), label: CDF_LABEL },
    {
      href: createRedirectLink('/data-sets'),
      label: DATA_SETS_LABEL,
    },
    {
      href: createExtPipePath(),
      label: EXTRACTION_PIPELINES,
    },
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
