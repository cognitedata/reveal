import React, { useEffect } from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import {
  SequenceDetails,
  SequencePreview as SequenceTabPreview,
} from 'lib/containers/Sequences';
import Metadata from 'lib/components/Details/Metadata';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Sequence } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';

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
  const history = useHistory();

  useEffect(() => {
    trackUsage('Exploration.Preview.Sequence', { sequenceId });
  }, [sequenceId]);

  const { data: sequence, isFetched, error } = useCdfItem<Sequence>(
    'sequences',
    { id: sequenceId }
  );

  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as SequencePreviewType;

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
        onTabChange={newTab => {
          history.push(
            createLink(
              `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
            )
          );
          trackUsage('Exploration.Details.TabChange', {
            type: 'sequence',
            tab: newTab,
          });
        }}
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
