import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { Sequence, SequenceColumn } from '@cognite/sdk';
import {
  DetailsItem,
  ErrorFeedback,
  Loader,
  SpacedRow,
  Tabs,
} from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { SequenceDetails } from 'lib/containers/Sequences';

const formatSequenceColumns = (columns: SequenceColumn[]) =>
  columns.reduce(
    (agg, cur) =>
      agg.concat([
        {
          column: cur.name || cur.externalId || `${cur.id}`,
          value: `${cur.valueType}${
            cur.description ? ` - ${cur.description}` : ''
          }`,
        },
      ]),
    [] as { column: string; value: string }[]
  );

export const SequencePreview = ({
  sequenceId,
  extraActions,
}: {
  sequenceId: number;
  extraActions?: React.ReactNode[];
}) => {
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
      <SpacedRow>{extraActions}</SpacedRow>

      <Row>
        <Col span={18}>
          <Tabs tab={currentTab} onTabChange={setTab}>
            <Tabs.Pane title="Details" key="details">
              <SequenceDetails sequence={sequence} showAll />
            </Tabs.Pane>
            <Tabs.Pane title="Columns " key="columns">
              {formatSequenceColumns((sequence && sequence.columns) ?? {}).map(
                el => (
                  <DetailsItem
                    key={el.column}
                    name={el.column}
                    value={el.value}
                  />
                )
              )}
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
