import { Context, createContext } from 'react';
import { useImage360Collections } from '../../hooks';

export type UseImage360EntityContextDependencies = {
  useImage360Collections: typeof useImage360Collections;
};

export const defaultUseImage360EntityContextDependencies: UseImage360EntityContextDependencies = {
  useImage360Collections
};

export const UseImage360EntityContext: Context<UseImage360EntityContextDependencies> = createContext<UseImage360EntityContextDependencies>(
  defaultUseImage360EntityContextDependencies
);
