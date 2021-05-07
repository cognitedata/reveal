import React from 'react';
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';

import { Title, Icon } from '@cognite/cogs.js';
import { Menu } from 'antd';

import { createLink } from '@cognite/cdf-utilities';

import APIKeys from 'pages/APIKeys';
import Groups from 'pages/Groups';
import IDP from 'pages/IDP';
import OIDC from 'pages/OIDC';
import SecurityCategories from 'pages/SecurityCategories';
import ServiceAccounts from 'pages/ServiceAccounts';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient, useIsFetching, useIsMutating } from 'react-query';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

export default function () {
  const client = useQueryClient();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { data: projectsRead } = usePermissions('projectsAcl', 'READ');
  const { data: groupsRead } = usePermissions('groupsAcl', 'LIST');
  const { data: usersRead } = usePermissions('usersAcl', 'LIST');
  const { data: secCatRead } = usePermissions('securityCategoriesAcl', 'LIST');
  const { data: keysRead } = usePermissions('apikeysAcl', 'LIST');

  const history = useHistory();
  const sdk = useSDK();
  const flow = sdk.getOAuthFlowType();
  const nativeTokens = flow === 'AAD_OAUTH' || flow === 'ADFS_OAUTH';

  const { params } = useRouteMatch<{
    tenant: string;
    path: string;
    page?: string;
  }>();
  const { pathname, search, hash } = history.location;

  return (
    <>
      <Title level={1}>
        Access management{' '}
        <Icon
          style={{
            cursor: 'pointer',
            color: 'var(--cogs-greyscale-grey5)',
          }}
          type={isFetching || isMutating ? 'Loading' : 'Refresh'}
          onClick={() => client.invalidateQueries()}
        />
      </Title>
      <StyledMeny
        mode="horizontal"
        selectedKeys={[params.page || 'groups']}
        onClick={e => {
          if (e.key !== params.page) {
            history.push(createLink(`/${params.path}/${e.key}`));
          }
        }}
      >
        <Menu.Item disabled={!groupsRead} key="groups">
          Groups
        </Menu.Item>
        <Menu.Item
          key="service-accounts"
          disabled={!usersRead}
          hidden={nativeTokens}
        >
          Service accounts
        </Menu.Item>
        <Menu.Item key="api-keys" disabled={!keysRead} hidden={nativeTokens}>
          API keys
        </Menu.Item>
        <Menu.Item key="security-categories" disabled={!secCatRead}>
          Security categories
        </Menu.Item>
        <Menu.Item key="oidc" disabled={!projectsRead}>
          OpenID connect
        </Menu.Item>
        <Menu.Item key="idp" disabled={!projectsRead} hidden={nativeTokens}>
          Identity provider configuration
        </Menu.Item>
      </StyledMeny>
      <Switch>
        <Redirect
          from="/:url*(/+)"
          to={{
            pathname: pathname.slice(0, -1),
            search,
            hash,
          }}
        />
        <Route
          path={`/${params.tenant}/${params.path}/groups`}
          component={Groups}
        />
        <Route
          path={`/${params.tenant}/${params.path}`}
          exact
          component={Groups}
        />
        <Route
          path={`/${params.tenant}/${params.path}/api-keys`}
          component={APIKeys}
        />
        <Route path={`/${params.tenant}/${params.path}/idp`} component={IDP} />
        <Route
          path={`/${params.tenant}/${params.path}/oidc`}
          component={OIDC}
        />
        <Route
          path={`/${params.tenant}/${params.path}/security-categories`}
          component={SecurityCategories}
        />
        <Route
          path={`/${params.tenant}/${params.path}/service-accounts`}
          component={ServiceAccounts}
        />
      </Switch>
    </>
  );
}

const StyledMeny = styled(Menu)`
  font-size: 16px;
  margin-bottom: 20px;
`;
