import React from 'react';
import { Tabs } from '@cognite/cogs.js';
import {
  ThreeDModelsResponse,
  useInfinite3DModels,
} from '@data-exploration-components/hooks';
import { Model3D } from '@cognite/sdk';
import { MORE_THAN_MAX_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from '@data-exploration-components/utils';
import { ResourceTabProps } from './types';

export const ThreeDTab = ({
  query,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data: modelData = { pages: [] as ThreeDModelsResponse[] } } =
    useInfinite3DModels(undefined, {
      enabled: true,
    });

  const models = modelData.pages.reduce(
    (accl, t) => accl.concat(t.items),
    [] as Model3D[]
  );

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(query?.toLowerCase() || '')
  );

  const count =
    filteredModels.length > 1000
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredModels.length;

  const chipRightProps = showCount
    ? { chipRight: { label: getTabCountLabel(count), size: 'x-small' } }
    : {};

  return <Tabs.Tab label="3D" {...chipRightProps} {...rest} />;
};
