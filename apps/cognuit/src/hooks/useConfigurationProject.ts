import head from 'lodash/head';
import { usePrepareDataTransfersQuery } from 'pages/DataTransfers/hooks/usePrepareDataTransfersQuery';

export const useConfigurationProject = () => {
  const { data } = usePrepareDataTransfersQuery();

  const firstConfigSample = head(data);
  if (!firstConfigSample) return undefined;

  const { source, target } = firstConfigSample;

  return {
    source: source.project,
    target: target.project,
  };
};
