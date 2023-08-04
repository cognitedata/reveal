import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { SequenceInfo } from '@data-exploration/containers';

import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Tabs } from '@cognite/cogs.js';
import {
  SequencePreview as SequenceTabPreview,
  ErrorFeedback,
} from '@cognite/data-exploration';
import { CogniteError, Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import {
  useTranslation,
  SUB_APP_PATH,
  createInternalLink,
} from '@data-exploration-lib/core';

// SequencePreviewType;
// - details
// - columns
// - assets
// - timeseries
// - files
// - sequences
// - events

export const SequenceDetail = ({
  sequenceId,
  actions,
}: {
  sequenceId: number;
  actions?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab || 'preview';

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Sequence', { sequenceId });
  }, [sequenceId]);

  const {
    data: sequence,
    isFetched: isSequenceFetched,
    error,
  } = useCdfItem<Sequence>('sequences', { id: sequenceId });

  useEffect(() => {
    if (isSequenceFetched && sequence) {
      // save Sequence preview as view resource in user history
      if (sequence?.name)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: sequence?.name,
          path: createInternalLink(pathname, searchParams),
        });
    }
  }, [isSequenceFetched, sequence]);

  if (!isSequenceFetched) {
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
      <BreadcrumbsV2 />
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
        onTabChange={handleTabChange}
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
