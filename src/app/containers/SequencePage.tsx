import React, { useEffect } from 'react';
import { useParams, useRouteMatch, useLocation } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { SequenceColumns, SequenceDetails } from 'lib/containers/Sequences';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { Sequence } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceDetailsTabs } from 'app/containers/ResourceDetails';

export type SequencePreviewType =
  | 'details'
  | 'columns'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const SequencePage = () => {
  const history = useHistory();
  const { id: sequenceIdString } = useParams<{
    id: string;
  }>();
  const sequenceId = parseInt(sequenceIdString, 10);

  const { hidePreview } = useResourcePreview();
  useEffect(() => {
    trackUsage('Exploration.Sequence', { sequenceId });
  }, [sequenceId]);

  useEffect(() => {
    hidePreview();
  }, [sequenceId, hidePreview]);

  const { data: sequence, isFetched, error } = useCdfItem<Sequence>(
    'sequences',
    { id: sequenceId }
  );

  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as SequencePreviewType;

  if (!sequenceIdString) {
    return null;
  }

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
      <ResourceTitleRow id={sequenceId} type="sequence" icon="GridFilled" />
      <Row>
        <Col span={24}>
          <ResourceDetailsTabs
            parentResource={{
              type: 'sequence',
              id: sequence.id,
              externalId: sequence.externalId,
            }}
            tab={activeTab}
            onTabChange={newTab =>
              history.push(
                createLink(
                  `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                )
              )
            }
            additionalTabs={[
              <Tabs.Pane title="Details" key="details">
                <SequenceDetails sequence={sequence} showAll />
              </Tabs.Pane>,
              <Tabs.Pane title="Columns " key="columns">
                <SequenceColumns sequence={sequence} />
              </Tabs.Pane>,
            ]}
          />
        </Col>
      </Row>
    </>
  );
};
