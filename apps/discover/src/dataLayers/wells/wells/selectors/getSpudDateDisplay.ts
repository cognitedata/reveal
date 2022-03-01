import { getDateOrDefaultText } from 'utils/date';

import { Well } from 'modules/wellSearch/types';

export const getSpudDateDisplay = <T extends Pick<Well, 'spudDate'>>(
  well: T
) => {
  return getDateOrDefaultText(well.spudDate);
};
