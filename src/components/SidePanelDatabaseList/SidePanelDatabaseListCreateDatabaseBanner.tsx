import React from 'react';

import { Body, Button, Colors, Detail, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

type SidePanelDatabaseListCreateDatabaseBannerProps = {
  onClick: () => void;
};

const StyledCreateDatabaseBannerWrapper = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent']};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 36px;
`;

const StyledCreateDatabaseBannerIcon = styled(Icon)`
  color: ${Colors['text-hint']};
`;

const StyledCreateDatabaseBannerTitle = styled(Body)`
  color: ${Colors['text-primary']};
  margin: 16px 0 8px;
`;

const StyledCreateDatabaseBannerDetail = styled(Detail)`
  color: ${Colors['text-hint']};
  margin-bottom: 16px;
  text-align: center;
`;

const SidePanelDatabaseListCreateDatabaseBanner = ({
  onClick,
}: SidePanelDatabaseListCreateDatabaseBannerProps): JSX.Element => {
  return (
    <StyledCreateDatabaseBannerWrapper>
      <StyledCreateDatabaseBannerIcon size={32} type="DataSource" />
      <StyledCreateDatabaseBannerTitle level={6} strong>
        Create your first database
      </StyledCreateDatabaseBannerTitle>
      <StyledCreateDatabaseBannerDetail strong>
        You can either create them manually here or through the api
      </StyledCreateDatabaseBannerDetail>
      <Button icon="Add" onClick={onClick} type="tertiary">
        Create database
      </Button>
    </StyledCreateDatabaseBannerWrapper>
  );
};

export default SidePanelDatabaseListCreateDatabaseBanner;
