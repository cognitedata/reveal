import env from 'utils/config';

import { EquipmentMutate } from '../../types';
import { useNodeMutate } from '../useNodeMutate';

export const useEquipmentMutate = () => {
  const { mutate } = useNodeMutate();

  return ({
    externalId,
    name,
    nodeId,
    type,
    isBroken,
    person,
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
      },
    });
};
