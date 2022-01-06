import React, { useMemo } from 'react';

import { BackButton, BaseButton } from 'components/buttons';
import { useWellInspectSelectedWellboreNames } from 'modules/wellInspect/hooks/useWellInspect';
import { useSelectedSecondaryWellboreNamesWithoutNptData } from 'modules/wellSearch/selectors';

import { SelectedWellboreNavigatable } from '../types';

import {
  DetailsContainer,
  NavigationPanelContainer,
  WellboreName,
  WellName,
} from './elements';

export interface NavigationPanelData extends SelectedWellboreNavigatable {
  wellName: string;
}

interface Props {
  data: NavigationPanelData;
  onChangeSelectedWellbore: (
    selectedWellbore: SelectedWellboreNavigatable
  ) => void;
  onCloseSelectedWellboreView: () => void;
  disableNavigation?: boolean;
}

export const NavigationPanel: React.FC<Props> = React.memo(
  ({
    data,
    onChangeSelectedWellbore,
    onCloseSelectedWellboreView,
    disableNavigation,
  }) => {
    const wellbores = useWellInspectSelectedWellboreNames();
    const wellboresWithoutNptData =
      useSelectedSecondaryWellboreNamesWithoutNptData();

    const { wellboreName, wellName, index } = data;

    const validIndexes = useMemo(
      () =>
        [...Array(wellbores.length).keys()].filter((index) => {
          const wellboreName = wellbores[index];
          return !wellboresWithoutNptData.includes(wellboreName);
        }),
      [JSON.stringify(wellbores)]
    );
    const indexOfValidIndexes = validIndexes.indexOf(index);
    const isFirstWellbore = indexOfValidIndexes === 0;
    const isLastWellbore = indexOfValidIndexes === validIndexes.length - 1;

    const navigateToWellboreOfNthIndex = (index: number) => {
      onChangeSelectedWellbore({
        wellboreName: wellbores[index],
        index,
      });
    };

    const handleNavigateToPreviousWellbore = () => {
      const previousIndex = validIndexes[indexOfValidIndexes - 1];
      navigateToWellboreOfNthIndex(previousIndex);
    };

    const handleNavigateToNextWellbore = () => {
      const nextIndex = validIndexes[indexOfValidIndexes + 1];
      navigateToWellboreOfNthIndex(nextIndex);
    };

    return (
      <NavigationPanelContainer>
        <BackButton onClick={onCloseSelectedWellboreView} />

        <DetailsContainer>
          <WellboreName>{wellboreName}</WellboreName>
          <WellName>{wellName}</WellName>
        </DetailsContainer>

        {!disableNavigation && (
          <>
            <BaseButton
              icon="ChevronLeft"
              type="secondary"
              onClick={handleNavigateToPreviousWellbore}
              disabled={isFirstWellbore}
              aria-label="previous-wellbore"
            />
            <BaseButton
              icon="ChevronRight"
              type="secondary"
              onClick={handleNavigateToNextWellbore}
              disabled={isLastWellbore}
              aria-label="next-wellbore"
            />
          </>
        )}
      </NavigationPanelContainer>
    );
  }
);
