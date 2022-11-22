import styled from 'styled-components/macro';
import { sizes } from 'styles/layout';
import { Title, Menu, TopBar } from '@cognite/cogs.js';
import layers from 'utils/zindex';

export const StyledTopBar = styled(TopBar)`
  z-index: ${layers.MAXIMUM};
  position: sticky;
  top: 0;
  background: var(--cogs-bg-default);
  .rc-tabs-tab:nth-child(-n + 2) {
    .rc-tabs-tab-btn {
      padding-right: 32px;
    }
  }
  .cogs-icon {
    z-index: ${layers.MAXIMUM};
  }

  .day-ahead-market-dropdown,
  .balancing-markets-dropdown {
    background-color: transparent;
  }
`;

export const Code = styled.code`
  background: var(--cogs-greyscale-grey3);
`;

export const LogOutButtonContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-right: ${sizes.small};
`;

export const LogoContainer = styled.div`
  width: 280px;
  height: 100%;
  .cogs-topbar--item {
    border-left: 0;
  }
`;

export const StyledMenu = styled(Menu)`
  margin-left: 16px;
  min-width: 189px;
`;

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;
