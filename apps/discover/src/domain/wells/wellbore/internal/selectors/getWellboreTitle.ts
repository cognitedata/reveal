import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

export const getWellboreTitle = ({
  name,
  description,
}: Pick<WellboreInternal, 'name' | 'description'>) => {
  if (!description || name === description) {
    return name;
  }

  return `${description} ${name}`.trim();
};
