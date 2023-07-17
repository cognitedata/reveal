import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import { usePermissions } from '@access-management/hooks';
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
  const { data: secCatRead } = usePermissions('securityCategoriesAcl', 'LIST');

  const params = useParams<{
    tenant: string;
    path: string;
    '*': string;
  }>();

  const page = params?.['*'] || 'groups';
  const navigate = useNavigate();

  const env = getCluster()?.split('.')[0];
  const isUnsupportedCluster =
    env === 'sapc-01' || env === 'openfield' || env === 'okd-dev-01';

  if (isFetching) {
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
        selectedKeys={[page || 'groups']}
        onClick={(e) => {
          if (e.key !== page) {
            navigate(createLink(`/${params.path}/${e.key}`));
          }
        }}
        style={{ fontSize: '16px', marginBottom: '20px' }}
      >
        <Menu.Item disabled={!groupsRead} key="groups">
          {t('groups')}
        </Menu.Item>
        <Menu.Item key="security-categories" disabled={!secCatRead}>
          {t('security-categories')}
        </Menu.Item>
        <Menu.Item key="oidc" disabled={!projectsRead}>
          {t('open-id-connect')}
        </Menu.Item>
        {!isUnsupportedCluster && (
          <Menu.Item key="user-profiles">{t('user-profiles')}</Menu.Item>
        )}
      </Menu>
      <Routes>
        <Route index element={<Groups />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/api-keys" element={<APIKeys />} />
        <Route path="/idp" element={<IDP />} />
        <Route path="/oidc" element={<OIDC />} />
        <Route path="/user-profiles" element={<UserProfiles />} />
        <Route path="/security-categories" element={<SecurityCategories />} />
        <Route path="/service-accounts" element={<ServiceAccounts />} />
      </Routes>
    </StyledAppContainerDiv>
  );
}

const StyledAppContainerDiv = styled.div`
  padding: 18px 44px;
`;
