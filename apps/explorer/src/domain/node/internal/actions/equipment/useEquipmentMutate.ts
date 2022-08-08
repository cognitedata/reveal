import env from 'utils/config';

import { EquipmentMutate } from '../../types';
import { useNodeMutate } from '../useNodeMutate';

export const useEquipmentMutate = (onSuccess?: () => void) => {
  const { mutate } = useNodeMutate(onSuccess);

  return ({
    externalId,
    name,
    nodeId,
    type,
    isBroken,
    person,
    room,
  }: Partial<EquipmentMutate>) =>
    mutate({
      modelName: env.dataModelStorage.modelNameEquipment,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        name,
        nodeId,
        type,
        isBroken,
        person,
        room,
      },
    });
};
