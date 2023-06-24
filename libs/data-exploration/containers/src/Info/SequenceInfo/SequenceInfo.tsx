import React from 'react';

import { TimeDisplay, GeneralDetails } from '@data-exploration/components';

import { Sequence } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';

export const SequenceInfo = ({ sequence }: { sequence: Sequence }) => {
  const { t } = useTranslation();

  return (
    <GeneralDetails>
      <GeneralDetails.Item
        key={sequence.name}
        name={t('NAME', 'Name')}
        value={sequence.name}
        copyable
      />
      <GeneralDetails.Item
        name={t('DESCRIPTION', 'Description')}
        value={sequence.description}
        copyable
      />
      <GeneralDetails.Item
        key={sequence.id}
        name={t('ID', 'ID')}
        value={sequence.id}
        copyable
      />
      <GeneralDetails.Item
        key={sequence.externalId}
        name={t('EXTERNAL_ID', 'External ID')}
        value={sequence.externalId}
        copyable
      />
      <GeneralDetails.DataSetItem id={sequence.id} type="sequence" />
      <GeneralDetails.AssetsItem
        assetIds={sequence.assetId ? [sequence.assetId] : undefined}
        linkId={sequence.id}
        type="sequence"
      />
      <GeneralDetails.Item
        name={t('CREATED_AT', 'Created at')}
        value={<TimeDisplay value={sequence.createdTime} />}
      />
      <GeneralDetails.Item
        name={t('UPDATED_AT', 'Updated at')}
        value={<TimeDisplay value={sequence.lastUpdatedTime} />}
      />
    </GeneralDetails>
  );
};
