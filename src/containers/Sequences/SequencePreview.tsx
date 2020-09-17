import React, { useEffect, useMemo, useState } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  itemSelector,
  retrieve,
} from '@cognite/cdf-resources-store/dist/sequences';
import { Button, Icon, Title } from '@cognite/cogs.js';
import {
  SequenceDetailsAbstract,
  DetailsItem,
  Wrapper,
  TimeDisplay,
  SpacedRow,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
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
  const dispatch = useResourcesDispatch();
  const sequence = useResourcesSelector(itemSelector)(sequenceId);

  useEffect(() => {
    if (!sequence) {
      dispatch(retrieve([{ id: sequenceId }]));
    }
  }, [dispatch, sequence, sequenceId]);

  const tabs = {
    'sequence-metadata': 'Sequence Details',
    columns: 'Columns',
  };

  const [currentTab, setTab] = useState<keyof typeof tabs>('sequence-metadata');

  const content = useMemo(() => {
    if (sequence) {
      switch (currentTab) {
        case 'sequence-metadata': {
          return (
            <>
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
            </>
          );
        }
        case 'columns': {
          return (
            <DescriptionList
              valueSet={formatSequenceColumns(sequence.columns ?? [])}
            />
          );
        }
      }
    }
    return <></>;
  }, [sequence, currentTab]);

  return (
    <Wrapper>
      <h1>
        <Icon type="GridFilled" />
        {sequence ? sequence.name : 'Loading...'}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>
      <SpacedRow>
        {Object.keys(tabs).map(el => {
          const key = el as keyof typeof tabs;
          return (
            <Button
              variant={key === currentTab ? 'default' : 'ghost'}
              type={key === currentTab ? 'primary' : 'secondary'}
              onClick={() => setTab(key)}
              key={key}
            >
              {tabs[key]}
            </Button>
          );
        })}
      </SpacedRow>
      {sequence && content}
    </Wrapper>
  );
};
