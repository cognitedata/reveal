import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemSelector, retrieve } from 'modules/sequences';
import { Button, Icon, Title } from '@cognite/cogs.js';
import {
  SequenceDetailsAbstract,
  DetailsItem,
  Wrapper,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { useHistory } from 'react-router-dom';
import { Tabs } from 'antd';
import moment from 'moment';
import { SequenceColumn } from '@cognite/sdk';

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
  const history = useHistory();
  const dispatch = useDispatch();
  const sequence = useSelector(itemSelector)(sequenceId);

  useEffect(() => {
    if (!sequence) {
      dispatch(retrieve([{ id: sequenceId }]));
    }
  }, [dispatch, sequence, sequenceId]);

  return (
    <Wrapper>
      <Button className="back-button" onClick={() => history.goBack()}>
        Back
      </Button>
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
              value={moment(sequence.createdTime).format('MM/DD/YYYY HH:MM')}
            />
            <DetailsItem
              name="Updated at"
              value={moment(sequence.lastUpdatedTime).format(
                'MM/DD/YYYY HH:MM'
              )}
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
