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
  useIdp,
  useLoginInfo,
} from '@cognite/login-utils';

import { useTranslation } from '../../../../i18n';
import ProjectListByCluster from '../ProjectListByCluster';

export const ProjectDropdown = () => {
  const { t } = useTranslation();
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: loginInfo, isFetched: didFetchLoginInfo } = useLoginInfo();

  const { data: idp } = useIdp(internalId);
  const loginFlowsByCluster = useMemo(() => {
    return getLoginFlowsByCluster(idp);
  }, [idp]);

  const handleGoBackToLoginPage = () => {
    window.location.href = '/';
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
