import React from 'react';
import { useHistory } from 'react-router-dom';

import { BackButton } from 'components/buttons';
import Skeleton from 'components/skeleton';
import navigation from 'constants/navigation';
import useSelector from 'hooks/useSelector';
import { useActiveWellsWellboresCount } from 'modules/wellSearch/selectors';
import { useSecondarySelectedWellsAndWellboresCount } from 'modules/wellSearch/selectors/asset/well';
import { InspectWellboreContext } from 'modules/wellSearch/types';

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
  const { wells, wellbores } = useActiveWellsWellboresCount();
  const {
    secondaryWells: selectedWells,
    secondaryWellbores: selectedWellbores,
  } = useSecondarySelectedWellsAndWellboresCount();
  const { allWellboresFetching, selectedFavoriteId, inspectWellboreContext } =
    useSelector((state) => state.wellSearch);
  const history = useHistory();

  const handleBackClick = () => {
    if (isCommingFromFavoriteWells()) {
      goToFavoriteWellsPage();
      return;
    }
    goToSearchWellsPage();
  };

  const isCommingFromFavoriteWells = () =>
    selectedFavoriteId &&
    favoriteWellsInspectOptions.includes(inspectWellboreContext);

  const favoriteWellsInspectOptions: InspectWellboreContext[] = [
    InspectWellboreContext.FAVORITE_CHECKED_WELLS,
    InspectWellboreContext.FAVORITE_HOVERED_WELL,
  ];

  const goToSearchWellsPage = () => history.push(navigation.SEARCH_WELLS);

  const goToFavoriteWellsPage = () =>
    history.push(navigation.FAVORITE_TAB_WELLS(selectedFavoriteId || ''));

  return (
    <SidebarHeader isOpen={isOpen}>
      <BackButton
        onClick={handleBackClick}
        data-testid="well-inspect-back-btn"
      />
      {allWellboresFetching ? (
        <Skeleton.Paragraph />
      ) : (
        <SidebarHeaderContent isOpen={isOpen}>
          <HeaderPrimaryContent>
            {selectedWells} / {wells} {wells > 1 ? 'wells' : 'well'} selected
          </HeaderPrimaryContent>
          <HeaderSecondaryContent>
            {selectedWellbores} / {wellbores}{' '}
            {wellbores > 1 ? 'wellbores' : 'wellbore'} selected
          </HeaderSecondaryContent>
        </SidebarHeaderContent>
      )}
    </SidebarHeader>
  );
};
