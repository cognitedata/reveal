import { Person } from 'graphql/generated';
import env from 'utils/config';

import { useNodeMutate } from './useNodeMutate';

export const usePersonMutate = () => {
  const { mutate } = useNodeMutate();

  return ({ externalId, name }: Partial<Person>) =>
    mutate({
      modelName: env.dataModelStorage.modelNamePerson,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        name,
      },
    });
};
