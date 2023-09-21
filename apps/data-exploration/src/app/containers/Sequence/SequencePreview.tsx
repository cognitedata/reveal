import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { SequenceInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import {
  SequencePreview as SequenceTabPreview,
  ErrorFeedback,
} from '@cognite/data-exploration';
import { CogniteError, Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';

import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import ResourceTitleRow from '../../components/ResourceTitleRow';
import { useCurrentResourceId, useOnPreviewTabChange } from '../../hooks/hooks';
import { trackUsage } from '../../utils/Metrics';
import { DetailsTabWrapper } from '../Common/element';
import { ResourceDetailsTabs } from '../ResourceDetails';

export type SequencePreviewType =
  | 'details'
  | 'columns'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const SequencePreview = ({
  sequenceId,
  actions,
}: {
  sequenceId: number;
  actions?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  const { tabType } = useParams<{
    tabType: SequencePreviewType;
  }>();
  const activeTab = tabType || 'preview';

  const onTabChange = useOnPreviewTabChange(tabType, 'sequence');
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Sequence', { sequenceId });
  }, [sequenceId]);

  const {
    data: sequence,
    isFetched,
    error,
  } = useCdfItem<Sequence>('sequences', { id: sequenceId });

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!sequence) {
    return (
      <>
        {t('RESOURCE_NOT_FOUND', `Sequence ${sequenceId} not found!`, {
          resourceType: t('SEQUENCE', 'Sequence'),
          id: sequenceId,
        })}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        currentResource={{
          title: sequence.name || sequence.externalId || String(sequence.id),
        }}
      />
      <ResourceTitleRow
        item={{ id: sequenceId, type: 'sequence' }}
        title={sequence.name}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'sequence',
          id: sequence.id,
          externalId: sequence.externalId,
          title: sequence.name || sequence.externalId || String(sequence.id),
        }}
        onTabChange={onTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            label={t('PREVIEW_TAB_LABEL', 'Preview')}
            tabKey="preview"
            key="preview"
          >
            <SequenceTabPreview sequence={sequence} />
          </Tabs.Tab>,
          <Tabs.Tab
            label={t('DETAILS', 'Details')}
            tabKey="details"
            key="details"
          >
            <DetailsTabWrapper>
              <SequenceInfo sequence={sequence} />
              <Metadata metadata={sequence.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
