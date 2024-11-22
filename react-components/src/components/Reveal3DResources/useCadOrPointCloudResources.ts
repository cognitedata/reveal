/*!
 * Copyright 2024 Cognite AS
 */

import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { useMemo } from 'react';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import { is360ImageAddOptions } from './typeGuards';
import {
  type AddResourceOptions,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions
} from './types';

export const useCadOrPointCloudResources = (
  resources: AddResourceOptions[]
): {
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>;
  cadOrPointCloudResources: Array<AddCadResourceOptions | AddPointCloudResourceOptions>;
} => {
  const cadOrPointCloudResources = useMemo(
    () =>
      resources.filter(
        (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
          !is360ImageAddOptions(resource)
      ),
    [resources]
  );

  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(
    cadOrPointCloudResources as Array<AddModelOptions<ClassicDataSourceType>>
  );

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map(({ data }) => data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  return { classicModelOptions, cadOrPointCloudResources };
};
