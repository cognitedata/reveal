import { useCallback, useEffect, useRef, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import queryString from 'query-string';
import { IdEither } from '@cognite/sdk';
import { extractUniqueIds } from '@data-exploration-lib/core';
import { SdkResourceType, useCdfItems } from '@cognite/sdk-react-query-hooks';
import copy from 'copy-to-clipboard';
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
    setIsOpen((prev) => !prev);
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
  const uniqueItems = unionBy(items, itemsWithExternalId, (file) => file.id);

  return {
    isError: itemsWithExternalIdError || itemsError,
    data: uniqueItems,
    isLoading: isItemWithExternalIdLoading || isItemLoading,
  };
}

/**
 * This hook gets an HTMLElement as ref and computes if it is overflowing
 * @param ref ref object to an HTMLElement
 * @returns boolean flag whether the HTMLElement is overflowing
 */
export const useIsOverflow = (ref: React.RefObject<HTMLElement>) => {
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (
      ref.current?.clientWidth &&
      ref.current?.scrollWidth &&
      ref.current?.clientHeight &&
      ref.current?.scrollHeight
    ) {
      if (
        ref.current?.clientWidth < ref.current?.scrollWidth ||
        ref.current?.clientHeight < ref.current?.scrollHeight
      ) {
        setIsOverflow(true);
      } else {
        setIsOverflow(false);
      }
    }
  }, [ref]);

  return isOverflow;
};

export interface UseClipboardOptions {
  /**
   * timeout delay (in ms) to switch back to initial state once copied.
   */
  timeout?: number;
  /**
   * Set the desired MIME type
   */
  format?: string;
}

/**
 * React hook to copy content to clipboard
 *
 *
 * @param {Number} [optionsOrTimeout=1500] optionsOrTimeout - delay (in ms) to switch back to initial state once copied.
 * @param {Object} optionsOrTimeout
 * @param {string} optionsOrTimeout.format - set the desired MIME type
 * @param {number} optionsOrTimeout.timeout - delay (in ms) to switch back to initial state once copied.
 *
 *
 */
export function useClipboard(
  optionsOrTimeout: number | UseClipboardOptions = {}
) {
  const [hasCopied, setHasCopied] = useState(false);

  const { timeout = 1500, ...copyOptions } =
    typeof optionsOrTimeout === 'number'
      ? { timeout: optionsOrTimeout }
      : optionsOrTimeout;

  const onCopy = useCallback(
    (value: string) => {
      const didCopy = copy(`${value}`, copyOptions);
      setHasCopied(didCopy);
    },
    [copyOptions]
  );

  useEffect(() => {
    let timeoutId: number | null = null;

    if (hasCopied) {
      timeoutId = window.setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeout, hasCopied]);

  return { onCopy, hasCopied };
}
