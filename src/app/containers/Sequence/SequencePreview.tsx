import React, { useEffect } from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import {
  SequenceDetails,
  SequencePreview as SequenceTabPreview,
} from 'lib/containers/Sequences';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { Sequence } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceDetailsTabs } from 'app/containers/ResourceDetails';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';

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
  actions?: TitleRowActionsProps['actions'];
}) => {
  const history = useHistory();

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
        actions={actions}
      />
      <Row style={{ marginLeft: 16, height: 'calc(100% - 82px)' }}>
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
              <Tabs.Pane title="Preview" key="preview">
                <SequenceTabPreview sequence={sequence} />
              </Tabs.Pane>,
              <Tabs.Pane title="Details" key="details">
                <SequenceDetails sequence={sequence} showAll />
              </Tabs.Pane>,
            ]}
          />
        </Col>
      </Row>
    </>
  );
};
