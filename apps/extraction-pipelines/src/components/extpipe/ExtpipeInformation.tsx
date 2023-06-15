import React, { useMemo, useState } from 'react';

import { useTranslation } from '@extraction-pipelines/common';
import { ContactsSection } from '@extraction-pipelines/components/extpipe/ContactsSection';
import { MetaDataSection } from '@extraction-pipelines/components/extpipe/MetaDataSection';
import { NotificationSection } from '@extraction-pipelines/components/extpipe/NotificationSection';
import RelativeTimeWithTooltip from '@extraction-pipelines/components/extpipes/cols/RelativeTimeWithTooltip';
import { getReadableSchedule } from '@extraction-pipelines/components/extpipes/cols/Schedule';
import RawTablesSection from '@extraction-pipelines/components/inputs/rawSelector/RawTablesSection';
import Link from '@extraction-pipelines/components/link';
import Section from '@extraction-pipelines/components/section';
import { useDataSetsList } from '@extraction-pipelines/hooks/useDataSetsList';
import { useSelectedExtpipe } from '@extraction-pipelines/hooks/useExtpipe';
import { DATASET_LIST_LIMIT } from '@extraction-pipelines/pages/create/DataSetIdInput';

import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';

import BasicInformationModal from './BasicInformationModal';

interface Props {
  canEdit: boolean;
}

export const ExtpipeInformation = ({ canEdit }: Props) => {
  const { t } = useTranslation();
  const { data: extpipe } = useSelectedExtpipe();

  const { data: dataSets } = useDataSetsList(DATASET_LIST_LIMIT);
  const dataSet = useMemo(() => {
    return dataSets?.find(({ id }) => id === extpipe?.dataSetId);
  }, [dataSets, extpipe]);

  const [isOpen, setIsOpen] = useState(false);

  if (!extpipe) {
    return null;
  }

  return (
    <>
      <BasicInformationModal
        extpipe={extpipe}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <Section
        title={t('ext-pipeline-info-title')}
        extra={
          <Button
            disabled={!canEdit}
            onClick={() => setIsOpen(true)}
            size="small"
            type="ghost"
          >
            {t('edit')}
          </Button>
        }
        icon="World"
        items={[
          {
            key: 'name',
            title: t('name'),
            value: extpipe.name ?? '-',
          },
          {
            key: 'description',
            title: t('description'),
            value: extpipe.description ?? '-',
          },
          {
            key: 'data-set-id',
            title: t('data-set'),
            value: extpipe.dataSetId ? (
              <Link to={createLink(`/data-sets/data-set/${extpipe.dataSetId}`)}>
                {dataSet?.name ?? dataSet?.externalId ?? extpipe.dataSetId}
              </Link>
            ) : (
              '-'
            ),
          },
          {
            key: 'source',
            title: t('source'),
            value: extpipe.source ?? '-',
          },
          {
            key: 'external-id',
            title: t('external-id'),
            value: extpipe.externalId ?? '-',
          },
          {
            key: 'schedule',
            title: t('schedule'),
            value: getReadableSchedule(extpipe.schedule, t),
          },
        ]}
      />
      <NotificationSection extpipe={extpipe} canEdit={canEdit} />
      <ContactsSection canEdit={canEdit} />
      <RawTablesSection canEdit={canEdit} />
      <MetaDataSection canEdit={canEdit} />
      <Section
        icon="Info"
        title={t('about-ext-pipeline')}
        items={[
          {
            key: 'id',
            title: t('ext-pipeline-id'),
            value: extpipe?.id,
          },
          {
            key: 'created-by',
            title: t('created-by'),
            value: extpipe?.createdBy,
          },
          {
            key: 'created-time',
            title: t('created-time'),
            value: (
              <RelativeTimeWithTooltip
                id="created-time"
                time={extpipe?.createdTime}
              />
            ),
          },
          {
            key: 'last-updated-time',
            title: t('last-updated-time'),
            value: (
              <RelativeTimeWithTooltip
                id="last-updated-time"
                time={extpipe?.lastUpdatedTime}
              />
            ),
          },
        ]}
      />
    </>
  );
};
