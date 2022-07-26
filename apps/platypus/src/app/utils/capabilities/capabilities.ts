import { SingleCogniteCapability, Acl, AclScopeAll } from '@cognite/sdk';
import diff from 'lodash/difference';

type AclTransformationActions = 'READ' | 'WRITE';
type AclExperimentActions = 'USE';
type ExperimentScope = {
  experimentscope: {
    experiments: string[];
  };
};

export type Capability =
  | SingleCogniteCapability
  | {
      transformationsAcl: Acl<AclTransformationActions, AclScopeAll>;
    }
  | {
      experimentAcl: Acl<AclExperimentActions, ExperimentScope>;
    };

type AllKeys<T> = T extends unknown ? keyof T : never;

export type KeysOfSCC = AllKeys<Capability>;

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type Combine<U> = UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type CombinedSCC = Combine<Capability>;

export const checkPermissions = <T extends KeysOfSCC>(
  name?: T,
  capability?: CombinedSCC[],
  permissions?: CombinedSCC[T]['actions']
) => {
  // check wether user has the required capabilities in his current groups of his token
  // as this func consumes array of permissions, we need to check if the user has all of them
  if (capability && name && permissions) {
    const foundCapability = capability.find((cap) => cap[name]);
    if (foundCapability) {
      return diff(permissions, foundCapability[name].actions).length === 0;
    }
  }
  return false;
};

export const checkAuthorized = (
  capability: CombinedSCC[],
  requestedGroups: string[],
  groupNames: string[]
) => {
  const hasGroups = requestedGroups.every((groupName) =>
    groupNames.includes(groupName)
  );
  const userCapabilities: string[] = capability.reduce((prev, current) => {
    if (
      current?.experimentAcl &&
      current?.experimentAcl?.scope?.experimentscope?.experiments?.length >= 1
    ) {
      return prev.concat(
        current.experimentAcl.scope.experimentscope.experiments
      );
    }
    return prev;
  }, [] as string[]);
  const hasRequiredTokenGroups = requestedGroups.every((groupName) =>
    userCapabilities.includes(groupName)
  );
  return hasGroups || hasRequiredTokenGroups;
};
