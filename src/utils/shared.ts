import { getProject } from '@cognite/cdf-utilities';
import { FileInfo } from '@cognite/sdk/dist/src';
import { useMemo } from 'react';
import { InfiniteData } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { styleScope } from 'styles/styleScope';
import { Items } from 'types';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const useUrlQuery = (
  q: string,
  replace = true
): [string | undefined, (newVal?: string) => void] => {
  const { pathname, hash, search } = useLocation();
  const navigate = useNavigate();
  const urlSearchParams = useMemo(() => new URLSearchParams(search), [search]);
  return [
    urlSearchParams.get(q) || undefined,
    (newVal?: string) => {
      if (newVal) {
        urlSearchParams.set(q, newVal);
      } else {
        urlSearchParams.delete(q);
      }

      navigate(`${pathname}?${urlSearchParams.toString()}#${hash}`, {
        replace,
      });
    },
  ];
};

export const filterFlow = (
  { name, metadata }: FileInfo,
  query?: string
): boolean | undefined => {
  if (!query) {
    return true;
  }
  const queries = query.split(' ');
  return (
    queries.filter(
      (subQ) =>
        name.toLowerCase().includes(subQ) ||
        metadata?.description?.toLowerCase().includes(subQ)
    ).length == queries.length
  );
};

export const collectPages = <T>(data?: InfiniteData<Items<T>>) =>
  data
    ? data.pages.reduce((accl, page) => [...accl, ...page.items], [] as T[])
    : ([] as T[]);

export const getProjectBaseUrl = (): string => {
  const project = getProject();

  return `/api/v1/projects/${project}`;
};

export const getTransformationsApiBaseUrl = (): string => {
  const baseUrl = getProjectBaseUrl();

  return `${baseUrl}/transformations`;
};
export const getTransformationsApiUrl = (path?: string): string => {
  const baseUrl = getTransformationsApiBaseUrl();

  return `${baseUrl}${path ?? ''}`;
};
