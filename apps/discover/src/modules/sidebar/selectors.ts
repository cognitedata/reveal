import { useMemo } from 'react';

import useSelector from 'hooks/useSelector';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { WellFilterMap } from 'modules/wellSearch/types';

import { AppliedFiltersType } from './types';

export const useSidebar = () => {
  return useSelector((state) => {
    return state.sidebar;
  });
};

/**
 * Filter bar Selectors
 */

export const useFilterBarIsOpen = () => {
  const state = useSidebar();
  return useMemo(() => state.isOpen, [state.isOpen]);
};

export const useFilterCategory = () => {
  const state = useSidebar();
  return useMemo(() => state.category, [state.category]);
};

export const useFilterActiveKeys = () => {
  const state = useSidebar();
  return useMemo(() => state.activeKeys, [state.activeKeys]);
};

export const useFilterAppliedFilters = (): AppliedFiltersType => {
  const state = useSidebar();
  return useMemo(() => state.appliedFilters, [state.appliedFilters]);
};

export const useAppliedDocumentFilters = (): DocumentsFacets => {
  const state = useSidebar();
  return useMemo(
    () => state.appliedFilters.documents,
    [state.appliedFilters.documents]
  );
};

export const useAppliedWellFilters = (): WellFilterMap => {
  const state = useSidebar();
  return useMemo(
    () => state.appliedFilters.wells,
    [state.appliedFilters.wells]
  );
};

export const useSearchPhrase = () => {
  const state = useSidebar();
  return useMemo(() => state.searchPhrase, [state.searchPhrase]);
};
