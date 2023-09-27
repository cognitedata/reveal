import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button, Tooltip } from '@cognite/cogs.js';

import { SUPPORTED_EXTRACTORS, useTranslation } from '../../common';
import { ExtractorWithReleases } from '../../service/extractors';

const SetUpConnectionButton = ({
  extractor,
  disabled,
}: {
  disabled?: boolean;
  extractor: ExtractorWithReleases;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      key={extractor.externalId}
      type="primary"
      style={{ width: '100%' }}
      disabled={disabled}
    >
      {t('set-up-hosted-extractor')}
    </Button>
  );
};

export const CreateConnectionButton = ({
  extractor,
}: {
  extractor: ExtractorWithReleases;
}) => {
  const { t } = useTranslation();
  const { search } = useLocation();

  if (SUPPORTED_EXTRACTORS.includes(extractor.externalId)) {
    return (
      <Link to={`create_new_connection${search}`} style={{ width: '100%' }}>
        <SetUpConnectionButton extractor={extractor} />
      </Link>
    );
  }
  return (
    <Tooltip content={t('coming-soon')} position="bottom-right">
      <SetUpConnectionButton extractor={extractor} disabled />
    </Tooltip>
  );
};
