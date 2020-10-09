import React, { useState } from 'react';
import { Icon, Title } from '@cognite/cogs.js';
import {
  DetailsItem,
  ErrorFeedback,
  Loader,
  SequenceDetailsAbstract,
  SpacedRow,
  Tabs,
  TimeDisplay,
  Wrapper,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { Sequence, SequenceColumn } from '@cognite/sdk';
import { useCdfItem } from 'hooks/sdk';

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

const SequenceDetails = ({ sequence }: { sequence: Sequence }) => (
  <div>
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
    <SequenceDetailsAbstract.SequenceInfoGrid sequence={sequence} showAll />
  </div>
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
    <Wrapper>
      <h1>
        <Icon type="GridFilled" />
        {sequence?.name}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>

      <Tabs tab={currentTab} onTabChange={setTab}>
        <Tabs.Pane title="Details" key="details">
          <SequenceDetails sequence={sequence} />
        </Tabs.Pane>
        <Tabs.Pane title="Columns " key="columns">
          <div>
            <DescriptionList
              valueSet={formatSequenceColumns(sequence.columns ?? [])}
            />
          </div>
        </Tabs.Pane>
      </Tabs>
    </Wrapper>
  );
};
