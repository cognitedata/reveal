import React from 'react';

import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { BackButton, BaseButton } from 'components/Buttons';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import {
  DetailsContainer,
  NavigationPanelContainer,
  WellboreName,
  WellName,
} from './elements';
import { NavigationPanelDataType, WellboreNavigationPanelProps } from './types';

export const WellboreNavigationPanel = <T extends NavigationPanelDataType>({
  data,
  currentWellboreName,
  onNavigate,
  onChangeData,
  onClickBack,
  disableNavigation,
}: WellboreNavigationPanelProps<T>) => {
  const groupedData = useDeepMemo(() => groupBy(data, 'wellboreName'), [data]);

  const wellboreNames = useDeepMemo(
    () => Object.keys(groupedData),
    [groupedData]
  );

  useDeepEffect(() => {
    if (!currentWellboreName) return;

    const updatedDataForCurrentWellbore = groupedData[currentWellboreName];
    onChangeData?.(updatedDataForCurrentWellbore);
  }, [data]);

  if (!currentWellboreName) {
    return null;
  }

  const currentData = groupedData[currentWellboreName];
  const navigationPanelData = head(currentData);

  if (!navigationPanelData) {
    return null;
  }

  const { wellName, wellboreName } = navigationPanelData;
  const currentWellboreIndex = wellboreNames.indexOf(wellboreName);

  const isFirstWellbore = currentWellboreIndex === 0;
  const isLastWellbore = currentWellboreIndex === wellboreNames.length - 1;

  const handleNavigation = (index: number) => {
    const wellboreName = wellboreNames[index];
    const data = groupedData[wellboreName];
    onNavigate?.(data);
  };

  const handleClickPrevious = () => handleNavigation(currentWellboreIndex - 1);

  const handleClickNext = () => handleNavigation(currentWellboreIndex + 1);

  return (
    <NavigationPanelContainer>
      <BackButton type="secondary" onClick={onClickBack} />

      <DetailsContainer>
        <WellboreName>{wellboreName}</WellboreName>
        <WellName>{wellName}</WellName>
      </DetailsContainer>

      {!disableNavigation && (
        <>
          <BaseButton
            icon="ChevronLeft"
            type="secondary"
            onClick={handleClickPrevious}
            disabled={isFirstWellbore}
            aria-label="previous-wellbore"
          />
          <BaseButton
            icon="ChevronRight"
            type="secondary"
            onClick={handleClickNext}
            disabled={isLastWellbore}
            aria-label="next-wellbore"
          />
        </>
      )}
    </NavigationPanelContainer>
  );
};
