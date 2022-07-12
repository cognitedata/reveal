import { NavigationPanel } from 'components/NavigationPanel';

import { WellboreNavigationPanelProps } from './types';

export const WellboreNavigationPanel = ({
  data,
  wellboreIds = [],
  onNavigate,
  onBackClick,
  disableNavigation,
}: WellboreNavigationPanelProps) => {
  if (!data) {
    return null;
  }

  const { wellboreMatchingId, wellboreName, wellName } = data;

  const currentWellboreIndex = wellboreIds.indexOf(wellboreMatchingId);

  const isFirstWellbore = currentWellboreIndex === 0;
  const isLastWellbore = currentWellboreIndex === wellboreIds.length - 1;

  const handleNavigation = (index: number) => {
    const wellboreId = wellboreIds[index];
    onNavigate?.(wellboreId);
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
