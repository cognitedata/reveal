import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useAssetsSearchAggregateQuery } from 'domain/assets';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from 'utils';

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
          {getTabCountLabel(count)}
        </Label>
      )}
    </TabContainer>
  );
};
