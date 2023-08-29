import {
  useCurrentLinkedView,
  useModelInstancesList,
} from '@fusion/contextualization';

import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useGetMatchInputInstances = () => {
  const linkedView = useCurrentLinkedView();

  const { data } = useModelInstancesList(
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version
  );

  const matchInputInstances = convertToInternalModelInstance(
    data,
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version
  );

  return matchInputInstances;
};
