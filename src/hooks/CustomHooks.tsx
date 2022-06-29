import { useEffect, useRef, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import queryString from 'query-string';
import { IdEither } from '@cognite/sdk';
import { extractUniqueIds } from 'utils/idUtils';
import { SdkResourceType, useCdfItems } from '@cognite/sdk-react-query-hooks';
import unionBy from 'lodash/unionBy';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}
export const useTenant = () => {
  const { tenant } = useParams<{ tenant: string }>();
  return tenant;
};

export const useEnv = (): string | undefined => {
  const param = queryString.parse(window.location.search).env;
  if (param instanceof Array) {
    return param[0] || undefined;
  }
  if (typeof param === 'string') {
    return param;
  }
  return undefined;
};

export const useUserStatus = () => {
  const sdk = useSDK();
  return useQuery(['login'], () => sdk.login.status());
};

interface UseDisclosureProps {
  isOpen?: boolean;
}

/**
 * This hooks can be use to deal with modal visible state and return the function to open and close functions
 * @param props {isOpen:Boolean}
 * @returns
 */
export const useDisclosure = (props?: UseDisclosureProps) => {
  const [isOpen, setIsOpen] = useState(false || !!props?.isOpen);

  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen(prev => !prev);
  };

  return { isOpen, onOpen, onClose, onToggle };
};

export function useUniqueCdfItems<T>(
  type: SdkResourceType,
  ids: IdEither[],
  ignoreUnknownIds = false
) {
  const { uniqueExternalIds, uniqueIds } = extractUniqueIds(ids);
  const itemsEnabled = uniqueIds && uniqueIds.length > 0;

  const itemsWithExternaIdEnabled =
    uniqueExternalIds && uniqueExternalIds.length > 0;

  const {
    data: items = [],
    isLoading: isItemLoading,
    isError: itemsWithExternalIdError,
  } = useCdfItems<T & { id: number }>(type, uniqueIds, ignoreUnknownIds, {
    enabled: itemsEnabled,
  });

  const {
    data: itemsWithExternalId = [],
    isLoading: isItemWithExternalIdLoading,
    isError: itemsError,
  } = useCdfItems<T & { id: number }>(
    type,
    uniqueExternalIds,
    ignoreUnknownIds,
    {
      enabled: itemsWithExternaIdEnabled,
    }
  );
  const uniqueItems = unionBy(items, itemsWithExternalId, file => file.id);

  return {
    isError: itemsWithExternalIdError || itemsError,
    data: uniqueItems,
    isLoading: isItemWithExternalIdLoading || isItemLoading,
  };
}
