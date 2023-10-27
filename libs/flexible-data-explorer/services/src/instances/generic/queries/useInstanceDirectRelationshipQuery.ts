import {
  useDataModelPathParams,
  useInstancePathParams,
} from '@fdx/shared/hooks/usePathParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { DataModelV2, Instance } from '@fdx/shared/types/services';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../queryKeys';

export const useInstanceDirectRelationshipQuery = <T = any>(
  {
    type,
    field,
  }: {
    field: string;
    type: string;
  },
  {
    instance,
    model,
  }: {
    instance?: Instance;
    model?: DataModelV2;
  } = {},
  {
    suspense,
    enabled,
  }: {
    suspense?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const client = useFDM();

  const dataModelPathParam = useDataModelPathParams();
  const instancePathParam = useInstancePathParams();

  const { dataType, instanceSpace, externalId } = instance || instancePathParam;
  const { dataModel, version, space } = model
    ? { ...model, dataModel: model.externalId }
    : dataModelPathParam;

  return useQuery(
    queryKeys.instanceDirect(
      { dataType, instanceSpace, externalId },
      { externalId: dataModel, version, space },
      { type, field }
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

      const instance = await client.getDirectRelationshipInstancesById(
        {
          relatedType: type,
          relatedField: field,
        },
        {
          dataModel,
          version,
          space,
          dataType,
          instanceSpace,
          externalId,
        }
      );

      return instance[field] as T;
    },
    {
      suspense,
      enabled,
    }
  );
};
