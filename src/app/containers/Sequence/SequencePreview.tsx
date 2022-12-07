import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { Tabs } from '@cognite/cogs.js';
import {
  SequenceDetails,
  SequencePreview as SequenceTabPreview,
  ErrorFeedback,
  Loader,
  Metadata,
} from '@cognite/data-exploration';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useOnPreviewTabChange } from 'app/hooks/hooks';
import { DetailsTabWrapper } from 'app/containers/Common/element';
import { Breadcrumbs } from 'app/components/Breadcrumbs/Breadcrumbs';

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
  const { tabType } = useParams<{
    tabType: SequencePreviewType;
  }>();
  const activeTab = tabType || 'preview';

  const onTabChange = useOnPreviewTabChange(tabType, 'sequence');

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
    return <ErrorFeedback error={error} />;
  }

  if (!sequence) {
    return <>Sequence {sequenceId} not found!</>;
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
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.TabPane tab={<TabTitle>Preview</TabTitle>} key="preview">
            <SequenceTabPreview sequence={sequence} />
          </Tabs.TabPane>,
          <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="details">
            <DetailsTabWrapper>
              <SequenceDetails sequence={sequence} />
              <Metadata metadata={sequence.metadata} />
            </DetailsTabWrapper>
          </Tabs.TabPane>,
        ]}
      />
    </>
  );
};
