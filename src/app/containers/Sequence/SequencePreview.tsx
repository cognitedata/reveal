import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import {
  SequenceDetails,
  SequencePreview as SequenceTabPreview,
  ErrorFeedback,
  Loader,
  Tabs,
  Metadata,
} from '@cognite/data-exploration';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Sequence } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useTabNavigationPreview } from 'app/hooks';

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

  const onTabChange = useTabNavigationPreview(tabType, 'sequence');

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
      <ResourceTitleRow
        item={{ id: sequenceId, type: 'sequence' }}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'sequence',
          id: sequence.id,
          externalId: sequence.externalId,
        }}
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.Pane
            title={<TabTitle>Preview</TabTitle>}
            style={{ padding: '20px 16px' }}
            key="preview"
          >
            <SequenceTabPreview sequence={sequence} />
          </Tabs.Pane>,
          <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
            <SequenceDetails sequence={sequence} />
            <Metadata metadata={sequence.metadata} />
          </Tabs.Pane>,
        ]}
      />
    </>
  );
};
