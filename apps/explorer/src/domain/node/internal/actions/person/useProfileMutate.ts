import env from 'utils/config';

import { PersonMutate } from '../../types';
import { useNodeMutate } from '../useNodeMutate';

export const useProfileMutate = () => {
  const { mutate } = useNodeMutate();

  return ({ externalId, name }: Partial<PersonMutate>) =>
    mutate({
      modelName: env.dataModelStorage.modelNamePerson,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        name,
      },
    });
};
