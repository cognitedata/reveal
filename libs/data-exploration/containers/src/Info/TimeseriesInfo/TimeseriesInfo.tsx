import React from 'react';

import { GeneralDetails, TimeDisplay } from '@data-exploration/components';

import { Timeseries } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';

import { TimeseriesLastReading } from '../../Timeseries';

export function TimeseriesInfo({ timeseries }: { timeseries: Timeseries }) {
  const { t } = useTranslation();

  return (
    <GeneralDetails>
      <GeneralDetails.Item
        name={t('NAME', 'Name')}
        key={`Name${timeseries.name}`}
        value={timeseries.name}
        copyable
      />
      <GeneralDetails.Item
        name={t('DESCRIPTION', 'Description')}
        value={timeseries.description}
        copyable
      />
      <GeneralDetails.Item name={t('UNIT', 'Unit')} value={timeseries.unit} />
      <GeneralDetails.Item
        name={t('ID', 'ID')}
        key={`ID${timeseries.id}`}
        value={timeseries.id}
        copyable
      />
      <GeneralDetails.Item
        key={`External_ID${timeseries.externalId}`}
        name={t('EXTERNAL_ID', 'External ID')}
        value={timeseries.externalId}
        copyable
      />
      <GeneralDetails.Item
        name={t('IS_STRING', 'Is String')}
        value={timeseries.isString ? 'True' : 'False'}
      />
      <GeneralDetails.Item
        name={t('IS_STEP', 'Is Step')}
        value={timeseries.isStep ? 'True' : 'False'}
      />
      <GeneralDetails.DataSetItem id={timeseries.id} type="timeSeries" />
      <GeneralDetails.AssetsItem
        assetIds={timeseries.assetId ? [timeseries.assetId] : undefined}
        linkId={timeseries.id}
        type="timeSeries"
      />
      <GeneralDetails.Item
        name={t('CREATED_AT', 'Created at')}
        value={<TimeDisplay value={timeseries.createdTime} />}
      />
      <GeneralDetails.Item
        name={t('UPDATED_AT', 'Updated at')}
        value={<TimeDisplay value={timeseries.lastUpdatedTime} />}
      />
      <GeneralDetails.Item
        name={t('LAST_READING', 'Last reading')}
        value={<TimeseriesLastReading timeseriesId={timeseries.id} />}
      />
    </GeneralDetails>
  );
}
