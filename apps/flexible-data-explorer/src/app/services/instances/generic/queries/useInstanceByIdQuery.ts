import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  useDataModelPathParams,
  useInstancePathParams,
} from '../../../../hooks/usePathParams';
import { useFDM } from '../../../../providers/FDMProvider';
import { queryKeys } from '../../../queryKeys';
import { DataModelV2, Instance } from '../../../types';

export const useInstancesQuery = ({
  instance,
  model,
}: {
  instance?: Instance;
  model?: DataModelV2;
} = {}) => {
  const client = useFDM();

  const dataModelPathParam = useDataModelPathParams();
  const instancePathParam = useInstancePathParams();

  const { dataType, instanceSpace, externalId } = instance || instancePathParam;
  const { dataModel, version, space } = model
    ? { ...model, dataModel: model.externalId }
    : dataModelPathParam;

  return useQuery(
    queryKeys.instance({ dataType, instanceSpace, externalId }),
    async () => {
      if (
        !(
          dataType &&
          externalId &&
          instanceSpace &&
          dataModel &&
          version &&
          space
        )
      ) {
        return Promise.reject(new Error('Missing headers...'));
      }

      return client.getInstancesById({
        dataModel,
        version,
        space,
        dataType,
        instanceSpace,
        externalId,
      });
    }
  );
};
