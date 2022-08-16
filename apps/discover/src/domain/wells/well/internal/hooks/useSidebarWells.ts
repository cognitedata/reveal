import { LIMIT_WELLBORES_NUMBER } from 'domain/wells/constants';

import { useLocation } from 'react-router-dom';

import { RELATED_DOCUMENTS } from 'constants/navigation';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';
import { useWellInspectWells } from './useWellInspectWells';

export const useSidebarWells = () => {
  const { wells } = useWellInspectWells();
  const wellbores = useWellInspectSelectedWellbores();
  const location = useLocation();

  const isOnRelatedDocumentsPage =
    location.pathname.includes(RELATED_DOCUMENTS);

  const wellboresAreUnderLimit = wellbores.length <= LIMIT_WELLBORES_NUMBER;

  if (!isOnRelatedDocumentsPage || wellboresAreUnderLimit) {
    return wells;
  }

  const limitedWellbores = wellbores.slice(0, LIMIT_WELLBORES_NUMBER);
  const wellsList = limitedWellbores.map((wellbore) => wellbore.wellId);

  return wells.filter((well) => wellsList.includes(well.id));
};
