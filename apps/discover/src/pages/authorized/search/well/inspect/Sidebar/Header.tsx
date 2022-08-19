import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { BackButton } from 'components/Buttons';
import {
  useWellInspectSelectionStats,
  useWellInspectGoBackNavigationPath,
} from 'modules/wellInspect/selectors';

import {
  HeaderPrimaryContent,
  HeaderSecondaryContent,
  SidebarHeader,
  SidebarHeaderContent,
} from './elements';

interface Props {
  isOpen: boolean;
}

export const Header: React.FC<Props> = ({ isOpen }) => {
  const {
    wellsCount,
    wellboresCount,
    selectedWellsCount,
    selectedWellboresCount,
  } = useWellInspectSelectionStats();
  const goBackNavigationPath = useWellInspectGoBackNavigationPath();
  const history = useHistory();

  const handleBackClick = () => history.push(goBackNavigationPath);

  return (
    <SidebarHeader isOpen={isOpen}>
      <BackButton
        margin={isOpen}
        onClick={handleBackClick}
        data-testid="well-inspect-back-btn"
      />
      <SidebarHeaderContent isOpen={isOpen}>
        <HeaderPrimaryContent>
          {selectedWellsCount} / {wellsCount}{' '}
          {wellsCount > 1 ? 'wells' : 'well'} selected
        </HeaderPrimaryContent>
        <HeaderSecondaryContent>
          {selectedWellboresCount} / {wellboresCount}{' '}
          {wellboresCount > 1 ? 'wellbores' : 'wellbore'} selected
        </HeaderSecondaryContent>
      </SidebarHeaderContent>
    </SidebarHeader>
  );
};
