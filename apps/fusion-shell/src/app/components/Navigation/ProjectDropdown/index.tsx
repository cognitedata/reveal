import React, { useMemo } from 'react';
import styled from 'styled-components';

import {
  Button,
  Colors,
  Detail,
  Flex,
  Icon,
  Menu,
  Title,
} from '@cognite/cogs.js';
import {
  getLoginFlowsByCluster,
  getSelectedIdpDetails,
  redirectToLogin,
  useLoginInfo,
  useValidatedLegacyProjects,
} from '@cognite/login-utils';

import { useTranslation } from '../../../../i18n';
import ProjectListByCluster from '../ProjectListByCluster';
import { readLoginHints } from '@cognite/auth-react/src/lib/base';
import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';

const loginHints = readLoginHints();

export const ProjectDropdown = () => {
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: loginInfo, isFetched: didFetchLoginInfo } = useLoginInfo();

  const { data: legacyProjectsByCluster } = useValidatedLegacyProjects(true);
  const { validLegacyProjects = [] } = legacyProjectsByCluster || {};

  const loginFlowsByCluster = useMemo(() => {
    return getLoginFlowsByCluster(
      loginInfo,
      internalId ?? loginHints?.idpInternalId,
      validLegacyProjects
    );
  }, [internalId, loginInfo, validLegacyProjects]);

  const handleGoBackToLoginPage = () => {
    if (isUsingUnifiedSignin()) {
      redirectToLogin();
    } else {
      window.location.href = '/';
    }
  };

  if (!didFetchLoginInfo) {
    return <Icon type="Loader" />;
  }

  return (
    <StyledProjectDropdownMenu>
      <StyledProjectDropdownSection>
        {loginInfo?.imageSquare && (
          <StyledProjectImage
            alt="organization logo"
            src={`data:${loginInfo?.imageSquare?.imageType};base64, ${loginInfo?.imageSquare?.imageData}`}
          />
        )}
        <Flex direction="column">
          <Title level={6}>{loginInfo?.label}</Title>
          <Detail strong>{loginInfo?.domain}</Detail>
        </Flex>
      </StyledProjectDropdownSection>
      <Menu.Divider />
      {Object.keys(loginFlowsByCluster).map((cluster) => (
        <ProjectListByCluster
          cluster={cluster}
          key={cluster}
          idp={loginFlowsByCluster[cluster].idp}
          isMultiCluster={Object.keys(loginFlowsByCluster).length > 1}
          legacyProjects={loginFlowsByCluster[cluster].legacyProjects}
        />
      ))}
      <Menu.Divider />
      <Button
        onClick={handleGoBackToLoginPage}
        icon="Logout"
        iconPlacement="right"
        type="ghost-accent"
      >
        {t('button-back-to-login')}
      </Button>
    </StyledProjectDropdownMenu>
  );
};

const StyledProjectDropdownMenu = styled(Menu)`
  min-width: 288px;

  .cogs-menu-divider {
    margin: 8px -8px;
  }
`;

const StyledProjectDropdownSection = styled.div`
  display: flex;
  padding: 8px;
`;

const StyledProjectImage = styled.img`
  border: 1px solid ${Colors['border--muted']};
  border-radius: 6px;
  height: 36px;
  margin-right: 12px;
  width: 36px;
`;
