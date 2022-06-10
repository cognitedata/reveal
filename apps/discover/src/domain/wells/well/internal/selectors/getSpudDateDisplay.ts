import { Well } from 'domain/wells/well/internal/types';

import { getDateOrDefaultText } from 'utils/date';

export const getSpudDateDisplay = <T extends Pick<Well, 'spudDate'>>(
  well: T
) => {
  return getDateOrDefaultText(well.spudDate);
};
