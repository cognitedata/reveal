import { useRef, DependencyList } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * The purpose of this hook is to effectively handle the dependency changes when a dependency is a data structure.
 *
 * ======================
 * CAN BE USED AS FOLLOWS
 * ======================
 *
 * Let `dep` is an array or an object array.
 *
 * useEffect(() => { // something }, useCompare([dep]));
 * useMemo(() => { // something }, useCompare([dep]));
 *
 * For multiple deps, `useCompare` can be used as follows.
 *
 * useCompare([dep1, dep2, dep3, ...])
 *
 *
 * **********************************************************************************
 *
 * This hook is inspired by an other third-party package.
 * Link to NPM: https://www.npmjs.com/package/use-custom-compare
 * Link to repository: https://github.com/kotarella1110/use-custom-compare
 *
 * **********************************************************************************
 */

export const useCompare = (deps: DependencyList) => {
  const ref = useRef<DependencyList | undefined>(undefined);

  if (!ref.current || !isEqual(ref.current, deps)) {
    ref.current = deps;
  }

  return ref.current;
};
