import React from 'react';
import { Breadcrumbs } from '@extraction-pipelines/components/navigation/breadcrumbs/Breadcrumbs';
import { createExtPipePath } from '@extraction-pipelines/utils/baseURL';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from '@extraction-pipelines/common';

export const ExtPipesBreadcrumbs = () => {
  const { t } = useTranslation();

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
    {
      href: createExtPipePath(),
      label: t('extraction-pipeline_other', { count: 0 }),
      dataTestId: 'extraction-pipeline',
    },
  ];
  return <Breadcrumbs breadcrumbs={currentPageBreadCrumbs} />;
};
