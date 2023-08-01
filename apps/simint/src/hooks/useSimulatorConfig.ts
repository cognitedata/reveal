import { useEffect, useMemo, useState } from 'react';

import type { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';
import { useGetDefinitionsQuery } from '@cognite/simconfig-api-sdk/rtk';

export function useSimulatorConfig({
  project,
  simulator,
}: {
  project: string;
  simulator: string;
}) {
  const [definitions, setDefinitions] = useState<DefinitionMap | undefined>(
    undefined
  );

  const { data, isLoading, isError } = useGetDefinitionsQuery({
    project,
  });

  useEffect(() => {
    if (!isLoading && !isError) {
      setDefinitions(data);
    }
  }, [data, isLoading, isError]);

  return useMemo(
    () =>
      definitions?.simulatorsConfig?.filter(
        ({ key }) => key === simulator
      )?.[0],
    [definitions?.simulatorsConfig, simulator]
  );
}
