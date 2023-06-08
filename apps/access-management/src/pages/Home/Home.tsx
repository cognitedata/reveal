import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import { useAuthConfiguration, usePermissions } from '@access-management/hooks';
import APIKeys from '@access-management/pages/APIKeys';
import Groups from '@access-management/pages/Groups';
import IDP from '@access-management/pages/IDP';
import OIDC from '@access-management/pages/OIDC';
import SecurityCategories from '@access-management/pages/SecurityCategories';
import ServiceAccounts from '@access-management/pages/ServiceAccounts';
import UserProfiles from '@access-management/pages/UserProfiles';
import {
  useQueryClient,
  useIsFetching,
  useIsMutating,
} from '@tanstack/react-query';
import Menu from 'antd/lib/menu';

import { createLink, getCluster } from '@cognite/cdf-utilities';
import { Title, Loader, Button } from '@cognite/cogs.js';

export default function () {
  const { t } = useTranslation();
  const client = useQueryClient();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const { data: projectsRead } = usePermissions('projectsAcl', 'READ');
  const { data: groupsRead } = usePermissions('groupsAcl', 'LIST');
  const { data: usersRead } = usePermissions('usersAcl', 'LIST');
  const { data: secCatRead } = usePermissions('securityCategoriesAcl', 'LIST');
  const { data: keysRead } = usePermissions('apikeysAcl', 'LIST');

  const params = useParams<{
    tenant: string;
    path: string;
    page?: string;
  }>();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const { data: authConfiguration, isFetched } = useAuthConfiguration();

  const env = getCluster().split('.')[0];
  const isUnsupportedCluster =
    env == 'sapc-01' || env == 'openfield' || env == 'okd-dev-01';

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <StyledAppContainerDiv>
      <Title level={1}>
        {t('access-management')}
        <Button
          aria-label={t('refetch-data')}
          css={{ marginLeft: '4px' }}
          icon={isFetching || isMutating ? 'Loader' : 'Refresh'}
          onClick={() => client.invalidateQueries()}
          size="small"
          type="ghost"
        />
      </Title>
      <Menu
        mode="horizontal"
        selectedKeys={[params.page || 'groups']}
        onClick={(e) => {
          if (e.key !== params.page) {
            navigate(createLink(`/${params.path}/${e.key}`));
          }
        }}
        style={{ fontSize: '16px', marginBottom: '20px' }}
      >
        <Menu.Item disabled={!groupsRead} key="groups">
          {t('groups')}
        </Menu.Item>
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="service-accounts" disabled={!usersRead}>
            {t('service-accounts')}
          </Menu.Item>
        )}
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="api-keys" disabled={!keysRead}>
            {t('api-keys')}
          </Menu.Item>
        )}
        <Menu.Item key="security-categories" disabled={!secCatRead}>
          {t('security-categories')}
        </Menu.Item>
        <Menu.Item key="oidc" disabled={!projectsRead}>
          {t('open-id-connect')}
        </Menu.Item>
        {!isUnsupportedCluster && (
          <Menu.Item key="user-profiles">{t('user-profiles')}</Menu.Item>
        )}
        {authConfiguration?.isLegacyLoginFlowAndApiKeysEnabled && (
          <Menu.Item key="idp" disabled={!projectsRead}>
            {t('identity-provider-configuration')}
          </Menu.Item>
        )}
      </Menu>
      <Routes>
        <Route
          path={`/${params.tenant}/${params.path}/groups`}
          element={
            <Navigate
              to={{
                pathname: pathname.slice(0, -1),
                search,
                hash,
              }}
            />
          }
        />

        <Route
          path={`/${params.tenant}/${params.path}/groups`}
          element={<Groups />}
        />
        <Route path={`/${params.tenant}/${params.path}`} element={<Groups />} />
        <Route
          path={`/${params.tenant}/${params.path}/api-keys`}
          element={<APIKeys />}
        />
        <Route
          path={`/${params.tenant}/${params.path}/idp`}
          element={<IDP />}
        />
        <Route
          path={`/${params.tenant}/${params.path}/oidc`}
          element={<OIDC />}
        />
        <Route
          path={`/${params.tenant}/${params.path}/user-profiles`}
          element={<UserProfiles />}
        />
        <Route
          path={`/${params.tenant}/${params.path}/security-categories`}
          element={<SecurityCategories />}
        />
        <Route
          path={`/${params.tenant}/${params.path}/service-accounts`}
          element={<ServiceAccounts />}
        />
      </Routes>
    </StyledAppContainerDiv>
  );
}

const StyledAppContainerDiv = styled.div`
  padding: 18px 44px;
`;
