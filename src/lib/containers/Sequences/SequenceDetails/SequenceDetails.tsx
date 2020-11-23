import React, { useState } from 'react';
import { Sequence, DataSet } from '@cognite/sdk';
import { Button, Title } from '@cognite/cogs.js';
import {
  DetailsItem,
  InfoGrid,
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
} from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

export const SequenceDetails = ({
  sequence,
  datasetLink,
  showAll = false,
}: {
  sequence: Sequence;
  datasetLink?: string;
  showAll?: boolean;
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(sequence.metadata || {}).length : 5
  );

  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: sequence?.dataSetId || 0 },
    { enabled: !!sequence && !!sequence?.dataSetId }
  );

  return (
    <>
      <DetailsTabGrid>
        <DetailsTabItem name="Description" value={sequence.description} />
        <DetailsTabItem
          name="External ID"
          value={sequence?.externalId}
          copyable
        />
        <DetailsTabItem name="ID" value={sequence.id} copyable />
        <DetailsTabItem
          name="Data set"
          value={dataset?.name}
          link={datasetLink}
        />
        <DetailsTabItem
          name="Created at"
          value={
            sequence ? (
              <TimeDisplay value={sequence.createdTime} />
            ) : (
              'Loading...'
            )
          }
        />
        <DetailsTabItem
          name="Updated at"
          value={
            sequence ? (
              <TimeDisplay value={sequence.lastUpdatedTime} />
            ) : (
              'Loading...'
            )
          }
        />
      </DetailsTabGrid>

      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Metadata
      </Title>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
        {Object.keys(sequence.metadata || {})
          .slice(0, displayedAmount)
          .map(key => (
            <DetailsItem key={key} name={key} value={sequence.metadata![key]} />
          ))}
      </InfoGrid>
      {Object.keys(sequence.metadata || {}).length > displayedAmount + 1 && (
        <Button
          style={{ width: '100%' }}
          onClick={() => setDisplayedAmount(displayedAmount + 5)}
        >
          Load more...
        </Button>
      )}
    </>
  );
};
