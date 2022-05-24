import {
  AccessRequirements,
  UserAccessList as CogniteUserAccessList,
} from '@cognite/react-acl';

import { SIDECAR } from 'constants/app';

export const UserAccessList: React.FC = () => {
  //
  // discover-api checking is disabled for now
  // we don't have a good case for enabling it yet
  //
  // const checkDiscoverAPIAccess = async (): Promise<Partial<AllAccess>> => {
  //   try {
  //     const result = await fetchGet<{ data: { message: string } }>(
  //       `${SIDECAR.discoverApiBaseUrl}/_status`,
  //       { headers }
  //     );
  //     if (result?.data?.message === 'OK') {
  //       return { 'discover-api': { missing: [] } };
  //     }
  //   } catch (error) {
  //     log(String(error));
  //   }
  //   return { 'discover-api': { missing: ['NETWORK'] } };
  // };

  const requirements: AccessRequirements = [
    { context: 'relationships', aclName: 'relationshipsAcl', acl: ['READ'] },
    { context: 'geospatial', aclName: 'geospatialAcl', acl: ['READ'] },
    { context: 'seismic', aclName: 'seismicAcl', acl: ['READ'] },
    { context: 'labels', aclName: 'labelsAcl', acl: ['READ'] },
    { context: 'datasets', aclName: 'datasetsAcl', acl: ['READ'] },
    { context: 'files', aclName: 'filesAcl', acl: ['READ', 'WRITE'] },
    { context: 'sequences', aclName: 'sequencesAcl', acl: ['READ'] },
    { context: 'assets', aclName: 'assetsAcl', acl: ['READ'] },
    { context: 'wells', aclName: 'wellsAcl', acl: ['READ'] },
  ];

  return (
    <CogniteUserAccessList
      requirements={requirements}
      baseUrl={SIDECAR.cdfApiBaseUrl}
    />
  );
};
