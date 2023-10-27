import { createContext, useContext, useMemo, useState } from 'react';
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';

import { queryKeys } from '@fdx/services/queryKeys';
import { FDMComposer } from '@fdx/shared/clients/FDMComposer';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { DataModelV2 } from '@fdx/shared/types/services';
import { buildFilterByDataType } from '@fdx/shared/utils/filterBuilder';
import { useQuery } from '@tanstack/react-query';
import { chunk } from 'lodash';

import { DmsUniqueIdentifier } from '@cognite/reveal-react-components';
import { ModelRevisionToEdgeMap } from '@cognite/reveal-react-components/dist/components/NodeCacheProvider/types';

export type DataTypeGroup = {
  items: ({ externalId: string; space: string } & Record<string, any>)[];
};

export const Mapped3DEquipmentContext = createContext<
  | {
      mappedEquipment: ModelRevisionToEdgeMap | undefined;
      setMappedEquipment: Dispatch<
        SetStateAction<ModelRevisionToEdgeMap | undefined>
      >;
    }
  | undefined
>(undefined);

export const Mapped3DEquipmentProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [mappedEquipment, setMappedEquipment] = useState<
    ModelRevisionToEdgeMap | undefined
  >(undefined);

  return (
    <Mapped3DEquipmentContext.Provider
      value={{ mappedEquipment, setMappedEquipment }}
    >
      {children}
    </Mapped3DEquipmentContext.Provider>
  );
};

export const useMappedEquipmentData = (enabled = true) => {
  const context = useContext(Mapped3DEquipmentContext);

  if (!context && enabled) {
    throw new Error(
      'useMappedEquipment must be used within an instance of Mapped3DEquipmentProvider'
    );
  }

  return context;
};

export const useMappedEquipmentInstances = (
  filtersByDataType: Record<string, unknown> = {},
  enabled = true
) => {
  const mappedEquipmentData = useMappedEquipmentData(enabled);
  const fdmSDK = useFDM();

  return useQuery(
    queryKeys.mappedEquipmentInstances(
      mappedEquipmentData?.mappedEquipment,
      filtersByDataType
    ),
    async () => {
      if (!mappedEquipmentData?.mappedEquipment) return {};

      const { mappedEquipment } = mappedEquipmentData;

      const dataTypeToExternalIdsMap: Map<
        string,
        { externalIds: DmsUniqueIdentifier[] }
      > = new Map();
      const instancesByDataType: {
        [key: string]: DataTypeGroup;
      } = {};

      mappedEquipment.forEach((edgesArray) => {
        edgesArray.forEach((edge) => {
          const viewExternalId = edge?.view?.externalId;

          if (!viewExternalId) return;

          const typeExternalIds = dataTypeToExternalIdsMap.get(viewExternalId);

          if (typeExternalIds === undefined) {
            dataTypeToExternalIdsMap.set(viewExternalId, {
              externalIds: [edge.edge.startNode],
            });

            return;
          }

          typeExternalIds.externalIds.push(edge.edge.startNode);
        });
      });

      for (const [dataType, externalIds] of dataTypeToExternalIdsMap) {
        const splitBySpaceValues = splitBySpace(
          externalIds.externalIds,
          ({ space }) => space
        );
        const dataModel = fdmSDK.getDataModelByDataType(dataType);

        if (!dataModel) continue;

        for (const space of Object.keys(splitBySpaceValues)) {
          const instances = await getInstancesByExternalIds(
            splitBySpaceValues[space],
            dataType,
            filtersByDataType,
            dataModel,
            fdmSDK
          );

          instancesByDataType[dataType] = {
            items: instances.map((instance) => {
              const { externalId, space: instanceSpace, ...rest } = instance;

              return { externalId, space: instanceSpace, ...rest };
            }),
          };
        }
      }

      return instancesByDataType;
    },
    {
      enabled: enabled && Boolean(mappedEquipmentData?.mappedEquipment),
      staleTime: Infinity,
    }
  );
};

export const useSearchMappedEquipment = (enabled = true) => {
  const [query] = useSearchQueryParams();

  const [filters] = useSearchFilterParams();
  const transformedFilter = useMemo(() => {
    return buildFilterByDataType(filters);
  }, [filters]);

  const { data: mappedEquipment } = useMappedEquipmentInstances(
    transformedFilter,
    enabled
  );

  return useQuery(
    queryKeys.searchMappedEquipmentInstances(query, transformedFilter),
    () => {
      if (!enabled || !mappedEquipment) return {};

      const mappedEquipmentByDataType: { [dataType: string]: DataTypeGroup } =
        {};

      Object.keys(mappedEquipment).forEach((dataType) => {
        mappedEquipmentByDataType[dataType] = filterDataTypeGroupBySearchQuery(
          mappedEquipment[dataType],
          query
        );
      });

      return mappedEquipmentByDataType;
    },
    {
      enabled: enabled && Boolean(mappedEquipment),
      staleTime: Infinity,
    }
  );
};

export const useSearchMappedEquipmentByDataTypeCount = (enabled = true) => {
  const { data: mappedEquipment, ...rest } = useSearchMappedEquipment(enabled);

  const data = useMemo(() => {
    if (!mappedEquipment) return {};

    const counts: Record<string, number> = {};

    Object.keys(mappedEquipment).forEach((dataType) => {
      counts[dataType] = mappedEquipment[dataType].items.length;
    });

    return counts;
  }, [mappedEquipment]);

  return { data, ...rest };
};

function splitBySpace<T>(
  array: Array<T>,
  getSpace: (a: T) => string
): Record<string, Array<T>> {
  const result: Record<string, Array<T>> = {};

  array.forEach((item) => {
    const space = getSpace(item);

    if (!result[space]) {
      result[space] = [];
    }

    result[space].push(item);
  });

  return result;
}

function filterDataTypeGroupBySearchQuery(
  dataTypeGroup: DataTypeGroup,
  query: string
) {
  return {
    items: dataTypeGroup.items.filter((item) => {
      const isInDescription = item.description
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const isInName = item.name?.toLowerCase().includes(query.toLowerCase());
      const isInExternalId = item.externalId
        ?.toLowerCase()
        .includes(query.toLowerCase());

      return isInDescription || isInName || isInExternalId;
    }),
  };
}

async function getInstancesByExternalIds(
  exernalIds: DmsUniqueIdentifier[],
  dataType: string,
  filters: Record<string, unknown> | undefined,
  dataModel: DataModelV2,
  fdmSDK: FDMComposer
) {
  const instances: Record<string, any>[] = [];

  const chunkedExternalIds = chunk(exernalIds, 1000);

  for (const chunkResult of chunkedExternalIds) {
    const chunkResults = await fdmSDK.getInstancesByIds(
      {
        dataType,
        space: dataModel.space,
        dataModel: dataModel.externalId,
        version: dataModel.version,
        externalIds: chunkResult.map((a) => a.externalId),
      },
      filters?.[dataType]
    );

    instances.push(...chunkResults);
  }

  return instances;
}
