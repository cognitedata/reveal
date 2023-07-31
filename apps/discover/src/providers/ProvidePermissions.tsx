import { createContext, useContext, FC, PropsWithChildren } from 'react';

import {
  AccessRequirements,
  AccessCheckResult,
  prepareData,
} from '@cognite/react-acl';

import { SIDECAR } from 'constants/app';

const requirements: AccessRequirements = [
  { context: 'relationships', aclName: 'relationshipsAcl', acl: ['READ'] },
  { context: 'geospatial', aclName: 'geospatialAcl', acl: ['READ'] },
  { context: 'seismic', aclName: 'seismicAcl', acl: ['READ'] },
  { context: 'labels', aclName: 'labelsAcl', acl: ['READ'] },
  { context: 'datasets', aclName: 'datasetsAcl', acl: ['READ'] },
  { context: 'files', aclName: 'filesAcl', acl: ['READ', 'WRITE'] },
  { context: 'sequences', aclName: 'sequencesAcl', acl: ['READ'] },
  { context: 'assets', aclName: 'assetsAcl', acl: ['READ'] },
  { context: 'events', aclName: 'eventsAcl', acl: ['READ', 'WRITE'] },
  { context: 'wells', aclName: 'wellsAcl', acl: ['READ'] },
];

export const PermissionsContext = createContext<AccessCheckResult>([]);

export const usePermissionsContext = () => useContext(PermissionsContext);

export const ProvidePermissions: FC<PropsWithChildren<object>> = ({
  children,
}) => {
  const data = prepareData({ baseUrl: SIDECAR.cdfApiBaseUrl, requirements });

  return (
    <PermissionsContext.Provider value={data}>
      {children}
    </PermissionsContext.Provider>
  );
};
