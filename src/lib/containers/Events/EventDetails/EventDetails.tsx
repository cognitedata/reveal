import React, { useState } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { InfoGrid, DetailsItem, TimeDisplay } from 'lib/components';
import { Button, Title } from '@cognite/cogs.js';

export const EventDetails = ({
  event,
  showAll = false,
}: {
  event: CogniteEvent;
  showAll?: boolean;
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(event.metadata || {}).length : 5
  );
  return (
    <>
      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Details
      </Title>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
        <DetailsItem name="ID" value={event.id} />
        <DetailsItem name="Description" value={event.description} />
        <DetailsItem
          name="Created at"
          value={<TimeDisplay value={event.createdTime} />}
        />
        <DetailsItem
          name="Updated at"
          value={<TimeDisplay value={event.lastUpdatedTime} />}
        />
        <DetailsItem name="External ID" value={event.externalId} />
      </InfoGrid>
      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Metadata
      </Title>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
        {Object.keys(event.metadata || {})
          .slice(0, displayedAmount)
          .map(key => (
            <DetailsItem key={key} name={key} value={event.metadata![key]} />
          ))}
      </InfoGrid>
      {Object.keys(event.metadata || {}).length > displayedAmount + 1 && (
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
