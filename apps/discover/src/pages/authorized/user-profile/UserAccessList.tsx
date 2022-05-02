import React from 'react';

import isFunction from 'lodash/isFunction';
import startCase from 'lodash/startCase';
import without from 'lodash/without';
import { useJsonHeaders } from 'services/service';
import styled from 'styled-components/macro';
import { fetchGet } from 'utils/fetch';

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

import { SIDECAR } from 'constants/app';

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
  | 'wells'

  // APIS:
  | 'discover-api';

type Access = {
  missing: string[];
  error?: string; // any extra error info we have found, eg: missing dataset
};
export type AllAccess = Record<ThingsToCheckAccessFor, Access>;
type AccessCheckResult = [ThingsToCheckAccessFor, Access];
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
  | 'wellsAcl'
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
  scope?: 'all';
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
  const headers = useJsonHeaders();
  // const idTokenHeaders = useJsonHeaders();

  const [access, setAccess] = React.useState<
    [ThingsToCheckAccessFor, Access][]
  >([]);

  const handleChange = (keys: string) => {
    log('Processed access: ', [keys, access], 1);
  };

  const checkDiscoverAPIAccess = async (): Promise<Partial<AllAccess>> => {
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
        if ('wellsAcl' in item) {
          return {
            ...checkACL({
              result,
              item,
              aclName: 'wellsAcl',
              acl: 'READ',
              context: 'wells',
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
        wells: { missing: ['READ'] },
        'discover-api': { missing: ['NETWORK'] },
      } as AllAccess
    );

    return acls;
  };

  const checkUserAccess = async () => {
    const tokenResults = await inspectToken();
    const discoverAPIResults = await checkDiscoverAPIAccess();

    const currentUserAccess: AllAccess = {
      ...tokenResults,
      ...discoverAPIResults,
    };

    const accessCheckResult = Object.entries(
      currentUserAccess
    ) as AccessCheckResult[];

    const sortedAccess = accessCheckResult.sort((value) => {
      if (value[1].missing.length > 0) {
        return -1;
      }

      return 1;
    });

    setAccess(sortedAccess);
  };

  React.useEffect(() => {
    checkUserAccess();
  }, []);

  return (
    <UserAccessContainer>
      <Collapse ghost onChange={handleChange}>
        <Collapse.Panel header="Show my access" key={1}>
          <>
            {access.length === 0 && 'Loading...'}
            {access.map((value) => {
              if (value[1].missing.length > 0) {
                return (
                  <div
                    key={value[0]}
                    data-testid={`access-list-item-${value[0]}`}
                  >
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
                <div
                  data-testid={`access-list-item-${value[0]}`}
                  key={value[0]}
                >
                  <GoodParagraph>
                    <Icon type="CheckmarkFilled" style={{ color: '#18AF8E' }} />
                    <div>{startCase(value[0])}</div>
                  </GoodParagraph>
                </div>
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
