import React from 'react';
import {
  CDF_LABEL,
  DATA_SETS_LABEL,
  EXTRACTION_PIPELINES,
} from 'utils/constants';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';
import { createExtPipePath } from 'utils/baseURL';
import { createLink } from '@cognite/cdf-utilities';

export const ExtPipesBreadcrumbs = () => {
  const currentPageBreadCrumbs = [
    { href: createLink(''), label: CDF_LABEL },
    {
      href: createLink('/data-sets'),
      label: DATA_SETS_LABEL,
    },
    {
      href: createExtPipePath(),
      label: EXTRACTION_PIPELINES,
    },
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
