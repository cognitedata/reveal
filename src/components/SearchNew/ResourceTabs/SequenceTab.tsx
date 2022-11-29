import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useSequenceSearchAggregateQuery } from 'domain/sequence';
import { ResourceTypeTitle, TabContainer } from './elements';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const SequenceTab = ({ query, filter, showCount = false }: Props) => {
  const {
    data: { count },
  } = useSequenceSearchAggregateQuery({
    filter,
    query,
  });

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Sequence'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {`${count}`}
        </Label>
      )}
    </TabContainer>
  );
};
