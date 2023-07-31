import { useMemo } from 'react';

import useSelector from 'hooks/useSelector';

export const useInspectTabs = () => {
  return useSelector((state) => state.inspectTabs);
};

export const useFilterDataNds = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(() => inspectTabs.nds, [inspectTabs]);
};

export const useFilterDataNpt = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(() => inspectTabs.npt, [inspectTabs.npt]);
};

export const useFilterDataLog = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(() => inspectTabs.log, [inspectTabs.log]);
};

export const useFilterDataTrajectory = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(() => inspectTabs.trajectory, [inspectTabs.trajectory]);
};

export const useOverviewPageErrors = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(() => inspectTabs.errors, [inspectTabs.errors]);
};

export const useRelatedDocumentsFilters = () => {
  const inspectTabs = useInspectTabs();
  return useMemo(
    () => inspectTabs.relatedDocuments.filters,
    [inspectTabs.relatedDocuments.filters]
  );
};
