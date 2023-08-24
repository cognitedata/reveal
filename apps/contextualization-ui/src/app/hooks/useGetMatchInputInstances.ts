import {
  useCurrentView,
  useModelInstancesList,
} from '@fusion/contextualization';

import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useGetMatchInputInstances = () => {
  const view = useCurrentView();

  const { data } = useModelInstancesList(
    view?.space,
    view?.externalId,
    view?.version
  );

  const matchInputInstances = convertToInternalModelInstance(
    data,
    view?.space,
    view?.externalId,
    view?.version
  );

  return matchInputInstances;
};
