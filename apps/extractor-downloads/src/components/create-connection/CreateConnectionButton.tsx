import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button, Tooltip } from '@cognite/cogs.js';

import { SUPPORTED_EXTRACTORS, useTranslation } from '../../common';
import { ExtractorWithReleases } from '../../service/extractors';

export const CreateConnectionButton = ({
  extractor,
}: {
  extractor: ExtractorWithReleases;
}) => {
  const { t } = useTranslation();
  const { search } = useLocation();

  if (SUPPORTED_EXTRACTORS.includes(extractor.externalId)) {
    return (
      <Link to={`create_new_connection${search}`}>
        <Button key={extractor.externalId} type="primary">
          {t('connect-to-hosted-extractor', {
            extractor: extractor?.name,
          })}
        </Button>
      </Link>
    );
  }
  return (
    <Tooltip content={t('coming-soon')} position="bottom-right">
      <Button key={extractor.externalId} type="primary" disabled>
        {t('connect-to-hosted-extractor', {
          extractor: extractor?.name,
        })}
      </Button>
    </Tooltip>
  );
};
