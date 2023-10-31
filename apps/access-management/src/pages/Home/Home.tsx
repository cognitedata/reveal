import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import Groups from '@access-management/pages/Groups';
import OIDC from '@access-management/pages/OIDC';
import SecurityCategories from '@access-management/pages/SecurityCategories';
import UserProfiles from '@access-management/pages/UserProfiles';
import {
  useQueryClient,
  useIsFetching,
  useIsMutating,
} from '@tanstack/react-query';
import Menu from 'antd/lib/menu';

import { createLink, getEnvFromCluster } from '@cognite/cdf-utilities';
import { Title, Loader, Button } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

export default function () {
  const { t } = useTranslation();
  const client = useQueryClient();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const { data: projectsRead, isFetched: isProjectsFetched } = usePermissions(
    'projectsAcl',
    'READ'
  );
  const { data: groupsRead, isFetched: isGroupsFetched } = usePermissions(
    'groupsAcl',
    'LIST'
  );
  const { data: secCatRead, isFetched: isSecCatReacFetched } = usePermissions(
    'securityCategoriesAcl',
    'LIST'
  );

  const params = useParams<{
    tenant: string;
    path: string;
    '*': string;
  }>();

  const page = params?.['*'] || 'groups';
  const navigate = useNavigate();

  const env = getEnvFromCluster();
  const isUnsupportedCluster =
    env === 'sapc-01' || env === 'openfield' || env === 'okd-dev-01';

  if (!isProjectsFetched || !isGroupsFetched || !isSecCatReacFetched) {
    return <Loader />;
  }

  return (
    <StyledAppContainerDiv>
      <Title level={1} data-testid="access-management-title">
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
        <Menu.Item
          disabled={!groupsRead}
          key="groups"
          data-testid="access-management-groups-tab"
        >
          {t('groups')}
        </Menu.Item>
        <Menu.Item
          key="security-categories"
          disabled={!secCatRead}
          data-testid="access-management-security-categories-tab"
        >
          {t('security-categories')}
        </Menu.Item>
        <Menu.Item
          key="oidc"
          disabled={!projectsRead}
          data-testid="access-management-openid-connect-tab"
        >
          {t('open-id-connect')}
        </Menu.Item>
        {!isUnsupportedCluster && (
          <Menu.Item
            key="user-profiles"
            data-testid="access-management-user-profiles-tab"
          >
            {t('user-profiles')}
          </Menu.Item>
        )}
      </Menu>
      <Routes>
        <Route index element={<Groups />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/oidc" element={<OIDC />} />
        <Route path="/user-profiles" element={<UserProfiles />} />
        <Route path="/security-categories" element={<SecurityCategories />} />
      </Routes>
    </StyledAppContainerDiv>
  );
}

const StyledAppContainerDiv = styled.div`
  padding: 18px 44px;
`;
