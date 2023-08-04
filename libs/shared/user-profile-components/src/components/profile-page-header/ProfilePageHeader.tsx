import styled from 'styled-components';

import { Title, Colors, Avatar } from '@cognite/cogs.js';

import { RESPONSIVE_BREAKPOINT } from '../../common/constants';
import { UserInfo } from '../../common/types';
import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';

export type ProfilePageHeaderProps = {
  userInfo?: UserInfo;
};

export const ProfilePageHeader = ({
  userInfo,
}: ProfilePageHeaderProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const profilePicture = userInfo?.profilePicture ?? '';
  const isScreenWideEnough = useIsScreenWideEnough();

  return (
    <HeaderSection>
      <Header>
        <Avatar
          size="large"
          text={name}
          image={profilePicture}
          tooltip={false}
        />
        <Title level={isScreenWideEnough ? 3 : 5}>{name}</Title>
      </Header>
    </HeaderSection>
  );
};

const HeaderSection = styled.div`
  /* TODO: set a constant */
  padding: 24px 0;
  width: 100%;

  background-color: ${Colors['surface--strong']};
  display: flex;
  justify-content: center;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    padding: 16px 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  width: 960px;
  padding: 0 16px;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    gap: 12px;
  }

  .cogs-squircle,
  .cogs-squircle__masked-container {
    width: 56px !important;
    height: 56px !important;

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
      width: 36px !important;
      height: 36px !important;
    }
  }

  .cogs-avatar__button {
    font-size: 18px !important;

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
      font-size: 14px !important;
      border: 2px solid ${Colors['surface--muted']};
    }
  }
`;
