import React, { useState } from 'react';
import { Sequence } from '@cognite/sdk';
import { InfoGrid, DetailsItem, TimeDisplay } from 'lib/components';
import { Button, Title } from '@cognite/cogs.js';

export const SequenceDetails = ({
  sequence,
  showAll = false,
}: {
  sequence: Sequence;
  showAll?: boolean;
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(sequence.metadata || {}).length : 5
  );
  return (
    <>
      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Details
      </Title>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
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
      </InfoGrid>
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
