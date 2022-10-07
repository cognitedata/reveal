import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styleScope } from 'styles/styleScope';
import { Flow } from 'types';

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
  { name, description }: Flow,
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
        description?.toLowerCase().includes(subQ)
    ).length == queries.length
  );
};
