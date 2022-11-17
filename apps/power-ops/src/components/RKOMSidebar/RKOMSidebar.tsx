import { NavLink, useLocation } from 'react-router-dom';
import { PAGES } from 'types';

import { PanelContent, StyledButton } from './elements';

type Props = {
  onNavigate?: (sectionName: string) => void;
};

export const RKOMSidebar = ({ onNavigate }: Props) => {
  const { pathname, search } = useLocation();

  return (
    <PanelContent>
      <NavLink
        to={`${PAGES.RKOM_BID}${search}`}
        onClick={() => onNavigate?.('bid')}
        data-testid="bid"
      >
        <StyledButton toggled={pathname.includes('/bid')} key="bid">
          <p>Bid</p>
        </StyledButton>
      </NavLink>
      {/* <NavLink
        to={PAGES.RKOM_PERFORMANCE}
        onClick={() => onNavigate?.('methodPerformance')}
        data-testid="performance"
      >
        <StyledButton
          toggled={pathname.includes('/performance')}
          key="performance"
        >
          <p>Method Performance</p>
        </StyledButton>
      </NavLink> */}
    </PanelContent>
  );
};
