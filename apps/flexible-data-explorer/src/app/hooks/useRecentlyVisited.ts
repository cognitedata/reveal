import { useCallback, useMemo } from 'react';

import { isEqual, isUndefined, omit, omitBy, take } from 'lodash';

import { useRecentlyVisitedLocalStorage } from './useLocalStorage';
import { useDataModelPathParams, useInstancePathParams } from './usePathParams';

// Todo: find a better place for this type
export type RecentlyViewed = {
  name: string;
  description?: string;

  dataModel: {
    externalId: string;
    space: string;
    version: string;
  };
  instance: {
    dataType: string;
    externalId: string;
    // Currently, files and timeseries does not have space
    space?: string;
  };
};

export const useRecentlyVisited = (): [
  RecentlyViewed[],
  (
    name?: string,
    description?: string,
    customInstance?: {
      dataType: string;
      externalId: string;
      space?: string | undefined;
    }
  ) => void
] => {
  const { dataModel, space, version } = useDataModelPathParams();
  const { dataType, instanceSpace, externalId } = useInstancePathParams();

  const [recentlyVisited, setRecentlyVisited] =
    useRecentlyVisitedLocalStorage();

  const addRecentlyVisited = useCallback(
    (
      name?: string,
      description?: string,
      customInstance?: {
        dataType: string;
        externalId: string;
        space?: string | undefined;
      }
    ) => {
      if (!(dataModel && space && version)) {
        return;
      }

      // if not customInstance or data type and external id is not defined, return out of function
      if (!customInstance && !(dataType && externalId)) {
        return;
      }

      const newRecentlyVisited = {
        name: name || customInstance?.externalId || externalId || 'No name...',
        description,
        instance: customInstance || {
          dataType,
          externalId,
          space: instanceSpace,
        },

        dataModel: {
          externalId: dataModel,
          space,
          version,
        },
      };

      const isInstanceAlreadyRecentlyVisited =
        recentlyVisited.length > 0 &&
        isEqual(recentlyVisited[0], omitBy(newRecentlyVisited, isUndefined));

      if (isInstanceAlreadyRecentlyVisited) {
        return;
      }

      const transformedRecentlyVisited = take(
        [newRecentlyVisited, ...recentlyVisited],
        5
      );

      setRecentlyVisited(transformedRecentlyVisited as any);
    },
    [
      dataModel,
      space,
      version,
      dataType,
      externalId,
      instanceSpace,
      recentlyVisited,
      setRecentlyVisited,
    ]
  );

  const getRecentlyVisited = useMemo(() => {
    return recentlyVisited;
  }, [recentlyVisited]);

  return [getRecentlyVisited, addRecentlyVisited];
};
