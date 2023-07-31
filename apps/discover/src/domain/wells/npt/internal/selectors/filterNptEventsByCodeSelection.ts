import flatten from 'lodash/flatten';
import { toBooleanMap } from 'utils/booleanMap';

import { NptCodesSelection, NptInternal } from '../types';

export const filterNptEventsByCodeSelection = (
  nptEvents: NptInternal[],
  codeSelection: NptCodesSelection
) => {
  const nptCodesSelection = toBooleanMap(Object.keys(codeSelection));
  const nptCodesDetailSelection = toBooleanMap(
    flatten(Object.values(codeSelection))
  );

  return nptEvents.filter(
    ({ nptCode, nptCodeDetail }) =>
      nptCodesSelection[nptCode] && nptCodesDetailSelection[nptCodeDetail]
  );
};
