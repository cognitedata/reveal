import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemSelector, retrieve } from 'modules/sequences';
import { Icon, Title } from '@cognite/cogs.js';
import {
  SequenceDetailsAbstract,
  DetailsItem,
  Wrapper,
  TimeDisplay,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { Tabs } from 'antd';
import { SequenceColumn } from 'cognite-sdk-v3';

const formatSequenceColumns = (columns: SequenceColumn[]) =>
  columns.reduce(
    (agg, cur) => ({
      ...agg,
      [cur.name || cur.externalId || cur.id]: `${cur.valueType}${
        cur.description ? ` - ${cur.description}` : ''
      }`,
    }),
    {}
  );

export const SequencePreview = ({
  sequenceId,
  extraActions,
}: {
  sequenceId: number;
  extraActions?: React.ReactNode[];
}) => {
  const dispatch = useDispatch();
  const sequence = useSelector(itemSelector)(sequenceId);

  useEffect(() => {
    if (!sequence) {
      dispatch(retrieve([{ id: sequenceId }]));
    }
  }, [dispatch, sequence, sequenceId]);

  return (
    <Wrapper>
      <h1>
        <Icon type="GridFilled" />
        {sequence ? sequence.name : 'Loading...'}
      </h1>
      {extraActions}
      {sequence && (
        <Tabs>
          <Tabs.TabPane key="details" tab="Sequence Details">
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Details
            </Title>
            <DetailsItem name="Description" value={sequence.description} />
            <DetailsItem
              name="Created at"
              value={<TimeDisplay value={sequence.createdTime} />}
            />
            <DetailsItem
              name="Updated at"
              value={<TimeDisplay value={sequence.lastUpdatedTime} />}
            />
            <DetailsItem name="External ID" value={sequence.externalId} />
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Metadata
            </Title>
            <SequenceDetailsAbstract.SequenceInfoGrid
              sequence={sequence}
              showAll
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="columns" tab="Columns">
            <DescriptionList
              valueSet={formatSequenceColumns(sequence.columns ?? [])}
            />
          </Tabs.TabPane>
        </Tabs>
      )}
    </Wrapper>
  );
};
