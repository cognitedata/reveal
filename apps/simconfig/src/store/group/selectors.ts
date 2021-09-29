import { StoreState } from 'store/types';
import { createSelector } from '@reduxjs/toolkit';

import { Capabilities } from './types';

export const selectGroups = (state: StoreState) => state.group.groups;

export const selectCapabilities = createSelector(selectGroups, (groups) =>
  // Unwrap CDF `Group[]` to `Capabilities` for simpler ACL handling
  // in the client
  groups.reduce<Capabilities>(
    (capabilities, group) => ({
      ...capabilities,
      ...group.capabilities?.reduce(
        (groupCapabilities, capability) => ({
          ...groupCapabilities,
          ...Object.entries(capability).reduce(
            (acl, [aclKey, { actions, scope }]) => {
              // Only add global scope capabilities
              if (!('all' in scope)) {
                return acl;
              }

              // Intended type assertion: SingleCogniteCapability objects are
              // returned from CDF, and never mutated in the client.
              //
              // `aclKey` (keyof SingleCogniteCapability) is converted to
              // Capabilities compatible format. E.g.: `groupsAcl` -> `groups`,
              // which is a valid Capabilities key.
              const key = aclKey.replace(/Acl$/, '') as keyof Capabilities;

              // Note: Duplicate actions are not filtered
              return {
                [key]: [...(capabilities[key] || []), ...actions],
              };
            },
            {}
          ),
        }),
        {}
      ),
    }),
    {}
  )
);

export const selectUploadDatasetIds = createSelector(selectGroups, (groups) =>
  // Select dataset IDs with filesAcl:WRITE permissions
  groups
    .flatMap((group) =>
      group.capabilities?.flatMap((capability) =>
        'filesAcl' in capability ? capability.filesAcl : undefined
      )
    )
    .filter((capability) => capability && capability?.actions.includes('WRITE'))
    .flatMap((capability) =>
      capability && 'datasetScope' in capability.scope
        ? capability.scope.datasetScope.ids.map((it) => +it) // CDF returns strings (which should be numbers according to spec)
        : []
    )
);
