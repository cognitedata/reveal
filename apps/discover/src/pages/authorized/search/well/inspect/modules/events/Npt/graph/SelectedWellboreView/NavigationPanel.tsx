import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { BackButton, BaseButton } from 'components/buttons';
import {
  clearNPTGraphSelectedWellboreData,
  setNPTGraphSelectedWellboreData,
} from 'modules/wellInspect/actions';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';
import {
  useSecondarySelectedOrHoveredWellboreNames,
  useSelectedSecondaryWellboreNamesWithoutNptData,
} from 'modules/wellSearch/selectors';

import {
  DetailsContainer,
  NavigationPanelContainer,
  WellboreName,
  WellName,
} from './elements';

export const NavigationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const wellbores = useSecondarySelectedOrHoveredWellboreNames();
  const wellboresWithoutNptData =
    useSelectedSecondaryWellboreNamesWithoutNptData();
  const selectedWellboreData = useNPTGraphSelectedWellboreData();

  const { index, data, groupedData } = selectedWellboreData;
  const { wellboreName, wellName } = data[0];

  const getDataOfNthIndex = (index: number) => {
    const wellbore = wellbores[index];
    const data = groupedData[wellbore];
    return { wellbore, data };
  };

  const validIndexes = useMemo(
    () =>
      [...Array(wellbores.length).keys()].filter((index) => {
        const { wellbore } = getDataOfNthIndex(index);
        return !wellboresWithoutNptData.includes(wellbore);
      }),
    [JSON.stringify(wellbores)]
  );
  const isFirstWellbore = validIndexes.indexOf(index) === 0;
  const isLastWellbore = validIndexes.indexOf(index) === wellbores.length - 1;

  const navigateToWellboreOfNthIndex = (index: number) => {
    const { wellbore, data } = getDataOfNthIndex(index);
    dispatch(
      setNPTGraphSelectedWellboreData({
        key: wellbore,
        index,
        data,
      })
    );
  };

  const handleClickBackButton = useCallback(
    () => dispatch(clearNPTGraphSelectedWellboreData()),
    []
  );

  const handleNavigateToPreviousWellbore = () => {
    const previousIndex = validIndexes[validIndexes.indexOf(index) - 1];
    navigateToWellboreOfNthIndex(previousIndex);
  };

  const handleNavigateToNextWellbore = () => {
    const nextIndex = validIndexes[validIndexes.indexOf(index) + 1];
    navigateToWellboreOfNthIndex(nextIndex);
  };

  return (
    <NavigationPanelContainer>
      <BackButton onClick={handleClickBackButton} />

      <DetailsContainer>
        <WellboreName>{wellboreName}</WellboreName>
        <WellName>{wellName}</WellName>
      </DetailsContainer>

      <BaseButton
        icon="ChevronLeftCompact"
        type="secondary"
        onClick={handleNavigateToPreviousWellbore}
        disabled={isFirstWellbore}
        aria-label="previous-wellbore"
      />
      <BaseButton
        icon="ChevronRightCompact"
        type="secondary"
        onClick={handleNavigateToNextWellbore}
        disabled={isLastWellbore}
        aria-label="next-wellbore"
      />
    </NavigationPanelContainer>
  );
};
