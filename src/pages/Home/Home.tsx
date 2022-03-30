import React from 'react';
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { Title, Icon, Loader } from '@cognite/cogs.js';
import { Menu } from 'antd';
import { createLink } from '@cognite/cdf-utilities';
import APIKeys from 'pages/APIKeys';
import Groups from 'pages/Groups';
import IDP from 'pages/IDP';
import OIDC from 'pages/OIDC';
import SecurityCategories from 'pages/SecurityCategories';
import ServiceAccounts from 'pages/ServiceAccounts';
import { useQueryClient, useIsFetching, useIsMutating } from 'react-query';
import { useAuthConfiguration, usePermissions } from 'hooks';

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

  const { params } = useRouteMatch<{
    tenant: string;
    path: string;
    page?: string;
  }>();
  const { pathname, search, hash } = history.location;

  const { data: authConfiguration, isFetched } = useAuthConfiguration();

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <StyledAppContainerDiv>
      <Title level={1}>
        Access management{' '}
        <Icon
          style={{
            cursor: 'pointer',
            color: 'var(--cogs-greyscale-grey5)',
          }}
          type={isFetching || isMutating ? 'Loader' : 'Refresh'}
          onClick={() => client.invalidateQueries()}
        />
      </Title>
      <StyledMeny
        mode="horizontal"
        selectedKeys={[params.page || 'groups']}
        onClick={(e) => {
          if (e.key !== params.page) {
            history.push(createLink(`/${params.path}/${e.key}`));
          }
        }}
      >
        <Menu.Item disabled={!groupsRead} key="groups">
          Groups
        </Menu.Item>
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="service-accounts" disabled={!usersRead}>
            Service accounts
          </Menu.Item>
        )}
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="api-keys" disabled={!keysRead}>
            API keys
          </Menu.Item>
        )}
        <Menu.Item key="security-categories" disabled={!secCatRead}>
          Security categories
        </Menu.Item>
        <Menu.Item key="oidc" disabled={!projectsRead}>
          OpenID connect
        </Menu.Item>
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="idp" disabled={!projectsRead}>
            Identity provider configuration
          </Menu.Item>
        )}
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
    </StyledAppContainerDiv>
  );
}

const StyledAppContainerDiv = styled.div`
  padding: 18px 44px;
`;

const StyledMeny = styled(Menu)`
  font-size: 16px;
  margin-bottom: 20px;
`;
