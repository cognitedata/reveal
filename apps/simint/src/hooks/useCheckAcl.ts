import React, { useMemo } from 'react';

import type { Acl, SingleCogniteCapability } from '@cognite/sdk';

import { useCapabilities } from './useCapabilities';

type TemporaryCapabilitiesList = [string, boolean][];

export type AclName = keyof SingleCogniteCapability;

export interface RequiredCapability {
  acl: AclName;
  actions: string[];
}

export const useCheckAcl = (requiredCapabilities: RequiredCapability[]) => {
  const { data: capabilities, isFetched } = useCapabilities();
  const [capabilityMap, setCapabilityMap] = React.useState<
    Record<string, boolean>
  >({});

  // to prevent reruns of the memo hook
  const capabilityString = requiredCapabilities.reduce(
    (acc, curr) => `${acc} + ${curr.acl as string}`,
    ''
  );

  useMemo(() => {
    if (isFetched) {
      const allCheckedCapabilities =
        requiredCapabilities.reduce<TemporaryCapabilitiesList>(
          (capabilityList: TemporaryCapabilitiesList, requiredCapability) => {
            const userCapability = capabilities?.find(
              (capability: SingleCogniteCapability) =>
                requiredCapability.acl in capability
            );
            if (userCapability) {
              const hasAllRequiredCapabilities =
                requiredCapability.actions.reduce(
                  (_acc: boolean, requiredAction: unknown) =>
                    Boolean(
                      (
                        userCapability[requiredCapability.acl] as Acl<
                          unknown,
                          unknown
                        >
                      ).actions.includes(requiredAction)
                    ),
                  false
                );
              capabilityList.push([
                requiredCapability.acl,
                hasAllRequiredCapabilities,
              ]);
            } else {
              capabilityList.push([requiredCapability.acl, false]);
            }
            return capabilityList;
          },
          []
        );
      setCapabilityMap(Object.fromEntries(allCheckedCapabilities));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capabilities, capabilityString, isFetched]);

  return {
    capabilityMap,
    // TODO - POFSP-82
    // hasAllCapabilities: Object.values(capabilityMap).reduce(
    //   (acc, curr) => acc && curr,
    //   true
    // ),
    hasAllCapabilities: true,
  };
};
