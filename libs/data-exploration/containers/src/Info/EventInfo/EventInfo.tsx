import React from 'react';

import { GeneralDetails, TimeDisplay } from '@data-exploration/components';

import { CogniteEvent } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';

export const EventInfo = ({ event }: { event: CogniteEvent }) => {
  const { t } = useTranslation();

  return (
    <GeneralDetails>
      <GeneralDetails.Item
        name={t('TYPE', 'Type')}
        key={`${event.type}-${event.id}`}
        value={event.type}
        copyable
      />
      <GeneralDetails.Item
        key={`${event.subtype}-${event.id}`}
        name={t('SUBTYPE', 'Subtype')}
        value={event.subtype}
        copyable
      />
      <GeneralDetails.Item
        name={t('DESCRIPTION', 'Description')}
        value={event.description}
        copyable
      />
      <GeneralDetails.Item
        key={event.id}
        name={t('ID', 'ID')}
        value={event.id}
        copyable
      />
      <GeneralDetails.Item
        key={event.externalId}
        name={t('EXTERNAL_ID', 'External ID')}
        value={event.externalId}
        copyable
      />
      <GeneralDetails.Item
        name={t('START_TIME', 'Start time')}
        value={<TimeDisplay value={event.startTime} />}
      />
      <GeneralDetails.Item
        name={t('END_TIME', 'End time')}
        value={<TimeDisplay value={event.endTime} />}
      />
      <GeneralDetails.DataSetItem id={event.id} type="event" />
      <GeneralDetails.AssetsItem
        assetIds={event.assetIds}
        linkId={event.id}
        type="event"
      />
      <GeneralDetails.Item
        name={t('CREATED_AT', 'Created at')}
        value={<TimeDisplay value={event.createdTime} />}
      />
      <GeneralDetails.Item
        name={t('UPDATED_AT', 'Updated at')}
        value={<TimeDisplay value={event.lastUpdatedTime} />}
      />
      <GeneralDetails.Item
        key={event.source}
        name={t('SOURCE', 'Source')}
        value={event.source}
        copyable
      />
    </GeneralDetails>
  );
};
