import { useMemo } from 'react';

import useSelector from 'hooks/useSelector';

export const useResultPanel = () => {
  return useSelector((state) => {
    return state.resultPanel;
  });
};

export const useSortByOptions = () => {
  const resultPanel = useResultPanel();
  return useMemo(() => resultPanel.sortBy, [resultPanel.sortBy]);
};

export const useResultPanelWidth = () => {
  const resultPanel = useResultPanel();
  return useMemo(() => resultPanel.panelWidth, [resultPanel.panelWidth]);
};

export const useActivePanel = () => {
  const resultPanel = useResultPanel();
  return useMemo(() => resultPanel.activePanel, [resultPanel.activePanel]);
};
