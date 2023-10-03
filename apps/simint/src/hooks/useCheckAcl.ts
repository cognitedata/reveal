import React, { useEffect, useMemo, useState } from 'react';

import { getProject } from '@cognite/cdf-utilities';
import {
  CapabilityItemModel,
  DefinitionMap,
  UserCapabilities,
  useGetDefinitionsQuery,
} from '@cognite/simconfig-api-sdk/rtk';

type CapabilityResult = {
  found: boolean;
  missing: CapabilityItemModel[];
  capabilityName: string;
};

export const useCheckAcl = (requiredCapabilities: string[]) => {
  const project = getProject();

  const {
    isSuccess,
    isLoading,
    isError,
    data: definitions,
  } = useGetDefinitionsQuery({
    project,
  });

  const userCapabilities = isSuccess
    ? (definitions.features as UserCapabilities[])
    : undefined;
  const [capabilityMap, setCapabilityMap] = React.useState<
    Record<string, CapabilityResult>
  >({});

  // to prevent reruns of the memo hook
  const capabilityString = userCapabilities?.reduce(
    (acc, curr) => `${acc} + ${curr.key as string}`,
    ''
  );

  useMemo(() => {
    let map = new Map();
    if (isSuccess && userCapabilities) {
      for (const requiredKey of requiredCapabilities) {
        const capability = userCapabilities.find(
          (currentCapability) => requiredKey === currentCapability.key
        );

        if (capability) {
          const isEnabled =
            capability.capabilities?.filter((cap) => cap.enabled).length ===
            (capability.capabilities ? capability.capabilities.length : 0);
          const capabilityName =
            capability.capabilities && capability.capabilities?.length > 0
              ? capability.capabilities[0].capability
              : requiredKey;
          map.set(capability.key, {
            found: isEnabled,
            missing: isEnabled === false ? capability.capabilities : [],
            capabilityName: capabilityName,
          });
        } else {
          map.set(requiredKey, {
            found: false,
            missing: [],
            capabilityName: requiredKey,
          });
        }
      }
      setCapabilityMap(Object.fromEntries(map));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capabilityString]);

  return {
    capabilityMap,
    hasAllCapabilities: Object.values(capabilityMap).reduce(
      (acc, curr) => acc && curr.found,
      true
    ),
  };
};
