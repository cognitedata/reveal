/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { useModelIdRevisionIdFromModelOptions } from '../../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../../utilities/isDefined';
import { type AddCadResourceOptions, type AddPointCloudResourceOptions } from '../types';

export const useClassicModelOptions = (
  cadOrPointCloudResources: Array<AddCadResourceOptions | AddPointCloudResourceOptions>
): Array<AddModelOptions<ClassicDataSourceType>> => {
  const addClassicModelOptionsResults =
    useModelIdRevisionIdFromModelOptions(cadOrPointCloudResources);

  return useMemo(
    () => addClassicModelOptionsResults.map(({ data }) => data).filter(isDefined),
    [addClassicModelOptionsResults]
  );
};
