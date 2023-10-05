import { useContextualizeThreeDViewerStoreCad } from '../useContextualizeThreeDViewerStoreCad';

export const useSyncStateWithViewerCad = () => {
  const { tool } = useContextualizeThreeDViewerStoreCad((state) => ({
    tool: state.tool,
  }));
};
