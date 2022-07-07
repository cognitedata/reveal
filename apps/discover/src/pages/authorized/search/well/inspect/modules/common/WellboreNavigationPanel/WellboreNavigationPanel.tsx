import { groupByWellboreMatchingId } from 'domain/wells/well/internal/transformers/groupByWellboreName';

import { useEffect, useMemo } from 'react';

import head from 'lodash/head';

import { NavigationPanel } from 'components/NavigationPanel';

import { NavigationPanelDataType, WellboreNavigationPanelProps } from './types';

export const WellboreNavigationPanel = <T extends NavigationPanelDataType>({
  data,
  currentWellboreMatchingId,
  onNavigate,
  onBackClick,
  disableNavigation,
}: WellboreNavigationPanelProps<T>) => {
  const groupedData = useMemo(() => groupByWellboreMatchingId(data), [data]);

  const wellboreIds = useMemo(() => Object.keys(groupedData), [groupedData]);

  useEffect(() => {
    if (!currentWellboreMatchingId) return;

    const currentData = groupedData[currentWellboreMatchingId];
    onNavigate?.({
      data: currentData,
      wellboreMatchingId: currentWellboreMatchingId,
    });
  }, [data]);

  if (!currentWellboreMatchingId) {
    return null;
  }

  const currentData = groupedData[currentWellboreMatchingId];
  const navigationPanelData = head(currentData);

  if (!navigationPanelData) {
    return null;
  }

  const { wellName, wellboreName, wellboreMatchingId } = navigationPanelData;
  const currentWellboreIndex = wellboreIds.indexOf(wellboreMatchingId);

  const isFirstWellbore = currentWellboreIndex === 0;
  const isLastWellbore = currentWellboreIndex === wellboreIds.length - 1;

  const handleNavigation = (index: number) => {
    const wellboreMatchingId = wellboreIds[index];
    const data = groupedData[wellboreMatchingId];
    onNavigate?.({ data, wellboreMatchingId });
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
