import flatten from 'lodash/flatten';
import { pluralize } from 'utils/pluralize';

export const getWellboreSelectionInfo = (
  wellboreSelectionMap: Record<string, string[]>
) => {
  const selectedWellsCount = Object.keys(wellboreSelectionMap).length;

  const selectedWellboresCount = flatten(
    Object.values(wellboreSelectionMap)
  ).length;

  const title = getSelectionTitle(selectedWellboresCount);
  const subtitle = getSelectionSubtitle(selectedWellsCount);

  return {
    title,
    subtitle,
    selectedWellsCount,
    selectedWellboresCount,
  };
};

export const getSelectionTitle = (selectedWellboresCount: number) => {
  return `${selectedWellboresCount} ${pluralize(
    'wellbore',
    selectedWellboresCount
  )} selected`;
};

export const getSelectionSubtitle = (count: number) => {
  return `From ${count} ${pluralize('well', count)}`;
};
