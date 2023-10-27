import { useMemo } from 'react';

import {
  useDataModelPathParams,
  useInstancePathParams,
} from '@fdx/shared/hooks/usePathParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { DataModelV2, Instance } from '@fdx/shared/types/services';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../queryKeys';

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

  const { data, ...rest } = useQuery(
    queryKeys.instance(
      { dataType, instanceSpace, externalId },
      {
        externalId: dataModel,
        version,
        space,
      }
    ),
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

  const transformedData = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const fields = client.getTypesByDataType(dataType)?.fields || [];

    return Object.keys(data).reduce((acc, key) => {
      const field = fields.find(({ name }) => name === key);

      const value = data[key];

      return {
        ...acc,
        [field?.displayName || field?.name || key]: value,
      };
    }, {} as Record<string, any>);
  }, [data, client, dataType]);

  return { data: transformedData, rawData: data, ...rest };
};
