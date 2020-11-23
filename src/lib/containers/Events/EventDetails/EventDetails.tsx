import React, { useState } from 'react';
import { CogniteEvent, DataSet } from '@cognite/sdk';
import {
  InfoGrid,
  DetailsItem,
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
} from 'lib/components';
import { Button, Title } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

export const EventDetails = ({
  event,
  datasetLink,
  showAll = false,
}: {
  event: CogniteEvent;
  datasetLink?: string;
  showAll?: boolean;
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(
    showAll ? Object.keys(event.metadata || {}).length : 5
  );

  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: event?.dataSetId || 0 },
    { enabled: !!event && !!event?.dataSetId }
  );

  return (
    <>
      <DetailsTabGrid>
        <DetailsTabItem name="Description" value={event.description} />
        <DetailsTabItem name="External ID" value={event.externalId} copyable />
        <DetailsTabItem name="ID" value={event.id} copyable />
        <DetailsTabItem
          name="Data set"
          value={dataset?.name}
          link={datasetLink}
        />
        <DetailsTabItem
          name="Created at"
          value={
            event ? <TimeDisplay value={event.createdTime} /> : 'Loading...'
          }
        />
        <DetailsTabItem
          name="Updated at"
          value={
            event ? <TimeDisplay value={event.lastUpdatedTime} /> : 'Loading...'
          }
        />
      </DetailsTabGrid>
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
