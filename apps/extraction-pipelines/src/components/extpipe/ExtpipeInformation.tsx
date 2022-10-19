import React, { useState } from 'react';
import InlineEdit from 'components/extpipe/InlineEdit';
import * as yup from 'yup';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { Schedule } from 'components/extpipe/edit/Schedule';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import RawTablesSection from 'components/inputs/rawSelector/RawTablesSection';
import { ContactsSection } from 'components/extpipe/ContactsSection';
import { MetaDataSection } from 'components/extpipe/MetaDataSection';
import { EditDataSetId } from 'components/extpipe/edit/EditDataSetId';
import Section from 'components/section';
import { NotificationSection } from 'components/extpipe/NotificationSection';
import {
  externalIdRule,
  metaDescriptionSchema,
  sourceSchema,
} from 'utils/validation/extpipeSchemas';
import { useTranslation } from 'common';
import RelativeTimeWithTooltip from 'components/extpipes/cols/RelativeTimeWithTooltip';
import { Button } from '@cognite/cogs.js';
import BasicInformationModal from './BasicInformationModal';

interface Props {
  canEdit: boolean;
}

export const ExtpipeInformation = ({ canEdit }: Props) => {
  const { t } = useTranslation();
  const { data: extpipe } = useSelectedExtpipe();

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
            Edit
          </Button>
        }
        icon="World"
        items={[
          {
            key: 'description',
            title: t('description'),
            value: (
              <InlineEdit
                name="description"
                hintText={t('description-hint')}
                placeholder={t('description-placeholder')}
                label={t('description')}
                canEdit={canEdit}
                schema={metaDescriptionSchema}
                defaultValues={{ description: extpipe?.description }}
                fullWidth
                updateFn={rootUpdate({ extpipe, name: 'description' })}
              />
            ),
          },
          {
            key: 'data-set-id',
            title: t('data-set'),
            value: <EditDataSetId canEdit={canEdit} />,
          },
          {
            key: 'source',
            title: t('source'),
            value: (
              <InlineEdit
                name="source"
                hintText={t('source-hint')}
                placeholder={t('source-placeholder')}
                label={t('source')}
                canEdit={canEdit}
                schema={sourceSchema}
                updateFn={rootUpdate({ extpipe, name: 'source' })}
                defaultValues={{
                  source: extpipe?.source,
                }}
                fullWidth
              />
            ),
          },
          {
            key: 'external-id',
            title: t('external-id'),
            value: (
              <InlineEdit
                name="externalId"
                hintText={t('external-id-hint')}
                placeholder={t('external-id-placeholder')}
                label={t('external-id')}
                canEdit={canEdit}
                schema={yup.object().shape(externalIdRule)}
                defaultValues={{ externalId: extpipe?.externalId }}
                fullWidth
                updateFn={rootUpdate({ extpipe, name: 'externalId' })}
              />
            ),
          },
          {
            key: 'schedule',
            title: t('schedule'),
            value: (
              <Schedule
                name="schedule"
                extpipe={extpipe}
                label={t('schedule')}
                canEdit={canEdit}
              />
            ),
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
