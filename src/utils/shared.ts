import { createLink } from '@cognite/cdf-utilities';
import { PredictionObject } from 'hooks/contextualization-api';
import {
  Dispatch,
  SetStateAction,
  useDebugValue,
  useState as reactUseState,
} from 'react';
import { styleScope } from 'styles/styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};

export function stringSorter<T extends Record<string, any>>(
  strA: T,
  strB: T,
  columnKey: keyof T
) {
  const a = strA[columnKey];
  const b = strB[columnKey];

  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  } else if (b.toLowerCase() > a.toLowerCase()) {
    return 1;
  } else return 0;
}

export const sleep = async (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const formatPredictionObject = (o: PredictionObject): string => {
  return o.name || o.description || o.externalId || o.id.toString();
};

function useDebugState<S>(
  initialState: S | (() => S),
  label: string = 'unknown'
): [S, Dispatch<SetStateAction<S>>] {
  const [v, setV] = reactUseState<S>(initialState);
  useDebugValue(`${label}: ${JSON.stringify(v)}`);
  return [v, setV];
}

function useVanillaState<S>(
  initialState: S | (() => S),
  _: string = ''
): [S, Dispatch<SetStateAction<S>>] {
  return reactUseState<S>(initialState);
}

export const useContextState =
  process.env.NODE_ENV === 'production' ? useVanillaState : useDebugState;
