import { ReactNode } from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

import Link from '../../../../components/Link/Link';

const HOME_PAGE_BUTTON_SIZE_IN_PX = 36;
const COGNITE_ICON_SIZE_IN_PX = 28;

type AppIconButtonProps = {
  logo?: ReactNode;
  onClick: () => void;
};
const AppIconButton = ({ logo, onClick }: AppIconButtonProps) => {
  return (
    <StyledHomePageLink onClick={onClick} to="/">
      {logo ?? <StyledAppIcon size={COGNITE_ICON_SIZE_IN_PX} type="Cognite" />}
    </StyledHomePageLink>
  );
};

const StyledAppIcon = styled(Icon)`
  color: ${Colors['text-icon--strong--inverted']};

  :hover {
    color: ${Colors['text-icon--medium--inverted']};
  }
`;

const StyledHomePageLink = styled(Link)`
  align-items: center;
  display: flex;
  height: ${HOME_PAGE_BUTTON_SIZE_IN_PX}px;
  justify-content: center;
  width: ${HOME_PAGE_BUTTON_SIZE_IN_PX}px;
`;

export default AppIconButton;
