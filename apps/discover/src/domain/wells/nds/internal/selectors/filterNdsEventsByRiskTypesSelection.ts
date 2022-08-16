import flatten from 'lodash/flatten';
import { toBooleanMap } from 'utils/booleanMap';

import { NdsInternal, NdsRiskTypesSelection } from '../types';

export const filterNdsEventsByRiskTypesSelection = (
  ndsEvents: NdsInternal[],
  typesSelection: NdsRiskTypesSelection
) => {
  const riskTypesSelection = toBooleanMap(Object.keys(typesSelection));
  const subtypesSelection = toBooleanMap(
    flatten(Object.values(typesSelection))
  );

  return ndsEvents.filter(
    ({ riskType, subtype }) =>
      riskType &&
      subtype &&
      riskTypesSelection[riskType] &&
      subtypesSelection[subtype]
  );
};
