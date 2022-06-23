import { groupByWellboreName } from 'domain/wells/well/internal/transformers/groupByWellboreName';

import { useEffect, useMemo } from 'react';

import head from 'lodash/head';

import { NavigationPanel } from 'components/NavigationPanel';

import { NavigationPanelDataType, WellboreNavigationPanelProps } from './types';

export const WellboreNavigationPanel = <T extends NavigationPanelDataType>({
  data,
  currentWellboreName,
  onNavigate,
  onBackClick,
  disableNavigation,
}: WellboreNavigationPanelProps<T>) => {
  const groupedData = useMemo(() => groupByWellboreName(data), [data]);

  const wellboreNames = useMemo(() => Object.keys(groupedData), [groupedData]);

  useEffect(() => {
    if (!currentWellboreName) return;

    const currentData = groupedData[currentWellboreName];
    onNavigate?.({ data: currentData, wellboreName: currentWellboreName });
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
    onNavigate?.({ data, wellboreName });
  };

  const onPreviousClick = () => handleNavigation(currentWellboreIndex - 1);

  const onNextClick = () => handleNavigation(currentWellboreIndex + 1);

  const navigationProps = disableNavigation
    ? {}
    : {
        onPreviousClick,
        onNextClick,
      };

  return (
    <NavigationPanel
      title={wellboreName}
      subtitle={wellName}
      {...navigationProps}
      onBackClick={onBackClick}
      isPreviousButtonDisabled={isFirstWellbore}
      isNextButtonDisabled={isLastWellbore}
    />
  );
};
