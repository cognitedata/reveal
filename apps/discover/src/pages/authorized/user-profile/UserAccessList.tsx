import React from 'react';

import isFunction from 'lodash/isFunction';
import startCase from 'lodash/startCase';
import without from 'lodash/without';
import styled from 'styled-components/macro';

import { Collapse, Icon } from '@cognite/cogs.js';
import { log } from '@cognite/react-container';
import {
  CogniteCapability,
  AclScopeAll,
  AclScopeIds,
  AclScopeDatasetsIds,
  AclScopeCurrentUser,
  AclScopeAssetsId,
  AclScopeTimeSeriesAssetRootIds,
} from '@cognite/sdk';

import { fetchGet } from '_helpers/fetch';
import { SIDECAR } from 'constants/app';
import { getJsonHeaders } from 'modules/api/service';

type ThingsToCheckAccessFor =
  // ACL's
  | 'relationships'
  | 'geospatial'
  | 'seismic'
  | 'labels'
  | 'files'
  | 'sequences'
  | 'datasets'
  | 'assets'
  | 'groups'

  // APIS:
  | 'discover-api'
  | 'wells-api';
type Access = {
  missing: string[];
  error?: string; // any extra error info we have found, eg: missing dataset
};
export type AllAccess = Record<ThingsToCheckAccessFor, Access>;
type ActionScope = {
  actions: string[];
  scope:
    | AclScopeAll
    | AclScopeIds
    | AclScopeAssetsId
    | AclScopeDatasetsIds
    | AclScopeCurrentUser
    | AclScopeTimeSeriesAssetRootIds;
};
type AclName =
  | 'groupsAcl'
  | 'assetsAcl'
  | 'eventsAcl'
  | 'filesAcl'
  | 'usersAcl'
  | 'projectsAcl'
  | 'securityCategoriesAcl'
  | 'rawAcl'
  | 'timeSeriesAcl'
  | 'apikeysAcl'
  | 'threedAcl'
  | 'sequencesAcl'
  | 'analyticsAcl'
  | 'relationshipsAcl'
  | 'geospatialAcl'
  | 'seismicAcl'
  | 'labelsAcl'
  | 'datasetsAcl';

type TokenCapabilities = {
  [x in AclName]?: ActionScope;
};

export const checkACL = ({
  result,
  item,
  aclName,
  acl,
  context,
  scope,
}: {
  result: AllAccess;
  item: TokenCapabilities;
  aclName: AclName;
  acl: string;
  context: ThingsToCheckAccessFor;
  scope?: 'all' | 'currentuserscope';
}): AllAccess => {
  const scopeToCheck = scope || 'all';

  // if we have not found this acl
  if (result[context]?.missing.includes(acl)) {
    const found = item[aclName];
    // if it exists
    if (found?.actions.includes(acl)) {
      const { scope } = found;
      if (scopeToCheck in scope) {
        return {
          ...result,
          [context]: {
            ...result[context],
            missing: without(result[context].missing, acl),
          },
        };
      }

      return {
        ...result,
        [context]: {
          ...result[context],
          error: () => (
            <>
              <strong>Missing scope:</strong>
              <span>{scopeToCheck}</span>
            </>
          ),
        },
      };
    }

    return {
      ...result,
      [context]: {
        ...result[context],
        error: `${context} not found`,
      },
    };
  }

  return result;
};

export const UserAccessList: React.FC = () => {
  const headers = getJsonHeaders();
  // const idTokenHeaders = getJsonHeaders();

  const [access, setAccess] = React.useState<AllAccess>();

  const handleChange = (keys: string) => {
    log('Processed access: ', [keys, access], 1);
  };

  const checkDiscoverAPIAccess = async () => {
    try {
      const result = await fetchGet<{ data: { message: string } }>(
        `${SIDECAR.discoverApiBaseUrl}/_status`,
        { headers }
      );

      if (result?.data?.message === 'OK') {
        return { 'discover-api': { missing: [] } };
      }
    } catch (error) {
      log(String(error));
    }

    return { 'discover-api': { missing: ['NETWORK'] } };
  };

  const checkWellsAPIAccess = async () => {
    try {
      const result = await fetchGet<string>(
        `https://well-service.${
          SIDECAR.cdfCluster === ''
            ? 'cognitedata-production'
            : SIDECAR.cdfCluster
        }.cognite.ai/docs`,
        { headers }
      );

      if (result.includes('Swagger')) {
        return { 'wells-api': { missing: [] } };
      }
    } catch (error) {
      log(String(error));
    }

    return { 'wells-api': { missing: ['NETWORK'] } };
  };

  const inspectToken = async () => {
    let result: { capabilities: CogniteCapability } = { capabilities: [] };
    try {
      result = await fetchGet<{ capabilities: CogniteCapability }>(
        `${SIDECAR.cdfApiBaseUrl}/api/v1/token/inspect`,
        { headers }
      );
    } catch (error) {
      log(String(error));
    }

    const acls = result.capabilities.reduce(
      (result, item) => {
        if ('filesAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'filesAcl',
              acl: 'READ',
              context: 'files',
            }),
          };
        }
        if ('assetsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'assetsAcl',
              acl: 'READ',
              context: 'assets',
            }),
          };
        }
        if ('sequencesAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'sequencesAcl',
              acl: 'READ',
              context: 'sequences',
            }),
          };
        }
        if ('groupsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'groupsAcl',
              acl: 'LIST',
              scope: 'currentuserscope',
              context: 'groups',
            }),
          };
        }
        if ('relationshipsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'relationshipsAcl',
              acl: 'READ',
              context: 'relationships',
            }),
          };
        }
        if ('labelsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'labelsAcl',
              acl: 'READ',
              context: 'labels',
            }),
          };
        }
        if ('seismicAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'seismicAcl',
              acl: 'READ',
              context: 'seismic',
            }),
          };
        }
        if ('datasetsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'datasetsAcl',
              acl: 'READ',
              context: 'datasets',
            }),
          };
        }
        if ('geospatialAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'geospatialAcl',
              acl: 'READ',
              context: 'geospatial',
            }),
          };
        }

        return result;
      },
      {
        relationships: { missing: ['READ'] },
        geospatial: { missing: ['READ'] },
        seismic: { missing: ['READ'] },
        labels: { missing: ['READ'] },
        datasets: { missing: ['READ'] },
        files: { missing: ['READ', 'WRITE'] },
        sequences: { missing: ['READ'] },
        assets: { missing: ['READ'] },
        groups: { missing: ['LIST'] },
        'discover-api': { missing: ['NETWORK'] },
        'wells-api': { missing: ['NETWORK'] },
      } as AllAccess
    );

    return acls;
  };

  const checkUserAccess = async () => {
    const tokenResults = await inspectToken();
    const discoverAPIResults = await checkDiscoverAPIAccess();
    const wellsAPIAccess = await checkWellsAPIAccess();

    setAccess({
      ...tokenResults,
      ...discoverAPIResults,
      ...wellsAPIAccess,
    });
  };

  React.useEffect(() => {
    checkUserAccess();
  }, []);

  return (
    <UserAccessContainer>
      <Collapse ghost onChange={handleChange}>
        <Collapse.Panel header="Show my access" key={1}>
          <>
            {!access && 'Loading...'}
            {access &&
              Object.entries(access).map((value) => {
                if (value[1].missing.length > 0) {
                  return (
                    <div key={value[0]}>
                      <ErrorParagraph>
                        <Icon type="ErrorFilled" style={{ color: '#D51A46' }} />
                        <div>{startCase(value[0])}:</div>
                      </ErrorParagraph>
                      <div>
                        <ErrorList>
                          {isFunction(value[1].error)
                            ? value[1].error()
                            : value[1].error}
                        </ErrorList>
                        <ErrorList>
                          <strong>Missing: </strong>-{' '}
                          {value[1].missing.join(', ')}
                        </ErrorList>
                      </div>
                    </div>
                  );
                }

                return (
                  <GoodParagraph key={value[0]}>
                    <Icon type="CheckmarkFilled" style={{ color: '#18AF8E' }} />
                    <div>{startCase(value[0])}</div>
                  </GoodParagraph>
                );
              })}
          </>
        </Collapse.Panel>
      </Collapse>
    </UserAccessContainer>
  );
};

const UserAccessContainer = styled.div`
  padding-top: 32px;
  .rc-collapse-content-box > div {
    margin: 10px;
  }
  cursor: default;
`;

const IconParagraph = styled.div`
  display: flex;
  align-items: center;

  div {
    padding-left: 5px;
  }
`;

const ErrorList = styled(IconParagraph)`
  padding-left: 15px;
  padding-bottom: 5px;
  flex-direction: column;
  align-items: start;
`;
const GoodParagraph = styled(IconParagraph)``;
const ErrorParagraph = styled(IconParagraph)``;
