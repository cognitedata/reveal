import { createAsyncThunk } from '@reduxjs/toolkit';
import { SingleCogniteCapability } from '@cognite/sdk';
import sdk from 'sdk-singleton';

export const fetchUserGroups = createAsyncThunk(
  'app/fetchUserGroups',
  async () => {
    const response = await sdk.groups.list();

    const groups = response.reduce(
      (prev, current) => {
        const a = {
          ...prev,
        };
        // @ts-ignore
        const { capabilities, permissions } = current;
        if (permissions) {
          a.assetsAcl = (a.assetsAcl || []).concat(permissions.accessTypes);
          a.filesAcl = (a.filesAcl || []).concat(permissions.accessTypes);
          a.timeSeriesAcl = (a.timeSeriesAcl || []).concat(
            permissions.accessTypes
          );
        }
        if (capabilities) {
          capabilities.forEach((capability: SingleCogniteCapability) => {
            Object.keys(capability).forEach((key) => {
              if (a[key]) {
                // @ts-ignore
                capability[key].actions.forEach((el) => {
                  if (a[key].indexOf(el) === -1) {
                    a[key].push(el);
                  }
                });
              } else {
                // @ts-ignore
                a[key] = capability[key].actions;
              }
            });
          });
        }
        return a;
      },
      { groupsAcl: ['LIST'] } as { [key: string]: string[] }
    );

    return {
      groups,
      loaded: true,
    };
  }
);
