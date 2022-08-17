import React from 'react';
import { Breadcrumbs } from 'components/navigation/breadcrumbs/Breadcrumbs';
import { createExtPipePath } from 'utils/baseURL';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

export const ExtPipesBreadcrumbs = () => {
  const { t } = useTranslation();
  const currentPageBreadCrumbs = [
    { href: createLink(''), label: t('cognite-data-fusion') },
    {
      href: createLink('/data-sets'),
      label: t('data-sets'),
    },
    {
      href: createExtPipePath(),
      label: t('extraction-pipeline_other', { count: 0 }),
    },
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
