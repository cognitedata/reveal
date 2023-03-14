import {
  ThreeDModelsResponse,
  useInfinite3DModels,
} from '@data-exploration-components/hooks';
import { Model3D } from '@cognite/sdk';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from '../../../utils';

import { ResourceTabProps } from './types';

export const ThreeDTab = ({ query, ...rest }: ResourceTabProps) => {
  const {
    data: modelData = { pages: [] as ThreeDModelsResponse[] },
    isLoading,
  } = useInfinite3DModels(undefined, {
    enabled: true,
  });

  const models = modelData.pages.reduce(
    (accl, t) => accl.concat(t.items),
    [] as Model3D[]
  );

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(query?.toLowerCase() || '')
  );

  const chipRightProps = getChipRightPropsForResourceCounter(
    filteredModels.length,
    isLoading
  );

  return <CounterTab label="3D" {...chipRightProps} {...rest} />;
};
