import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { SequenceColumns, SequenceDetails } from 'lib/containers/Sequences';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { Sequence } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

export const SequencePage = () => {
  const { sequenceId: sequenceIdString } = useParams<{
    sequenceId: string;
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

  const { data: relationships } = useRelationships(sequence?.externalId);

  const [currentTab, setTab] = useState('details');

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
        <Col span={18}>
          <Tabs tab={currentTab} onTabChange={setTab}>
            <Tabs.Pane title="Details" key="details">
              <SequenceDetails sequence={sequence} showAll />
            </Tabs.Pane>
            <Tabs.Pane title="Columns " key="columns">
              <SequenceColumns sequence={sequence} />
            </Tabs.Pane>
          </Tabs>
        </Col>
        <Col span={6}>
          <ResourceDetailsSidebar relations={relationships} />
        </Col>
      </Row>
    </>
  );
};
