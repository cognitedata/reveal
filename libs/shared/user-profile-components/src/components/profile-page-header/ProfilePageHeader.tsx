import styled from 'styled-components';

import { Title, Colors, Avatar } from '@cognite/cogs.js';

export type ProfilePageHeaderProps = {
  name: string;
};

export const ProfilePageHeader = ({
  name,
}: ProfilePageHeaderProps): JSX.Element => {
  return (
    <HeaderSection>
      <Header>
        <Avatar size="large" text={name} tooltip={false} static />
        <Title level={3}>{name}</Title>
      </Header>
    </HeaderSection>
  );
};

const HeaderSection = styled.div`
  /* TODO: set a constant */
  height: 108px;
  width: 100%;

  background-color: ${Colors['surface--strong']};
  display: flex;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  width: 960px;

  .cogs-squircle,
  .cogs-squircle__masked-container {
    width: 56px !important;
    height: 56px !important;
  }

  .cogs-avatar__button {
    font-size: 18px;
  }
`;
