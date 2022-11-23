import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useAssetsSearchAggregateQuery } from 'domain/assets';
import { ResourceTypeTitle, TabContainer } from './elements';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const AssetsTab = ({ query, filter, showCount = false }: Props) => {
  const {
    data: { count },
  } = useAssetsSearchAggregateQuery({
    assetsFilters: filter,
    query,
  });

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Assets'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {count}
        </Label>
      )}
    </TabContainer>
  );
};
