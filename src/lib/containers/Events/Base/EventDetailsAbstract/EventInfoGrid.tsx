import React, { useState } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { InfoGrid, DetailsItem } from 'lib/components';
import { Button } from '@cognite/cogs.js';

export const EventInfoGrid = ({
  event,
  showAll = false,
  additionalRows = [],
}: {
  event: CogniteEvent;
  showAll?: boolean;
  additionalRows?: React.ReactNode[];
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(event.metadata || {}).length : 5
  );
  return (
    <>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
        {additionalRows}
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
