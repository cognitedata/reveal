import React, { useState } from 'react';
import { Sequence } from '@cognite/sdk';
import { InfoGrid, DetailsItem } from 'components/Common';
import { Button } from '@cognite/cogs.js';

export const SequenceInfoGrid = ({
  sequence,
  showAll = false,
  additionalRows = [],
}: {
  sequence: Sequence;
  showAll?: boolean;
  additionalRows?: React.ReactNode[];
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(sequence.metadata || {}).length : 5
  );
  return (
    <>
      <InfoGrid noBorders style={{ flex: 1, overflow: 'auto' }}>
        {additionalRows}
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
