import React from 'react';
import { Label } from '@cognite/cogs.js';
import { ThreeDModelsResponse, useInfinite3DModels } from 'hooks';
import { Model3D } from '@cognite/sdk';
import { MORE_THAN_MAX_RESULT_LIMIT } from 'domain/constants';
import { ResourceTypeTitle, TabContainer } from './elements';

type Props = {
  query?: string;
  showCount?: boolean;
};

export const ThreeDTab = ({ query, showCount = false }: Props) => {
  const { data: modelData = { pages: [] as ThreeDModelsResponse[] } } =
    useInfinite3DModels(undefined, {
      enabled: true,
    });

  const models = modelData.pages.reduce(
    (accl, t) => accl.concat(t.items),
    [] as Model3D[]
  );

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(query?.toLowerCase() || '')
  );

  const count =
    filteredModels.length > 1000
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredModels.length;

  return (
    <TabContainer>
      <ResourceTypeTitle>{'3D'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {count}
        </Label>
      )}
    </TabContainer>
  );
};
