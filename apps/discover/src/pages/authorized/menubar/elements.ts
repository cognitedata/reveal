import styled from 'styled-components/macro';

import { TopBar } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const Container = styled.div`
  position: sticky;
  width: 100%;
  top: 0;
  background: var(--cogs-white);

  & > * .navigation-item {
    font-weight: 400 !important;
  }

  & > * .logo-title {
    font-weight: 600 !important;
    color: var(--cogs-greyscale-grey9) !important;
  }
`;
export const LogoWrapper = styled.div`
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;

export const TopBarLogo = styled(TopBar.Logo)`
  cursor: pointer;
`;

export const TopBarNavigationWrapper = styled(TopBar.Navigation)`
  .rc-tabs-nav {
    width: 100%;
  }
`;
