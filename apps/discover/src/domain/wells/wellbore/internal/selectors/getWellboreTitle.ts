import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

export const getWellboreTitle = ({ name, description }: WellboreInternal) => {
  if (!description || name === description) {
    return name;
  }

  return `${description} ${name}`.trim();
};
