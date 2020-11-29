import { useMutation, useQueryCache } from 'react-query';
import { Integration } from '../model/Integration';
import { SDKError } from '../model/SDKErrors';
import { updateContacts } from '../utils/IntegrationsAPI';
import { CreateUpdateContactsObjArgs } from '../utils/contactsUtils';

export interface UseUpdateContactsVariables
  extends CreateUpdateContactsObjArgs {
  project: string;
}

export const useUpdateContacts = () => {
  const queryCache = useQueryCache();
  return useMutation<Integration, SDKError, UseUpdateContactsVariables>(
    ({ project, data, id }) => {
      return updateContacts(project, { data, id });
    },
    {
      onMutate: (vars) => {
        queryCache.cancelQueries(['integration', vars.id, vars.project]);
        const previous = queryCache.getQueryData([
          'integration',
          vars.id,
          vars.project,
        ]);
        queryCache.setQueryData<Integration, SDKError>(
          ['integration', vars.id, vars.project],
          (old) => {
            const key = vars.data.accessor;
            if (key === 'authors') {
              const authors = vars.data.original.map((author, index) => {
                if (index === vars.data.indexInOriginal) {
                  return {
                    ...author,
                    name: vars.data.name,
                    email: vars.data.email,
                  };
                }
                return author;
              });
              return {
                ...old,
                [key]: authors,
              } as Integration;
            }
            const owner = { name: vars.data.name, email: vars.data.email };
            return { ...old, [key]: owner } as Integration;
          }
        );
        return previous;
      },
      onError: (_, vars, previous) => {
        queryCache.setQueryData(
          ['integration', vars.id, vars.project],
          previous
        );
      },
      onSettled: (_, __, vars) => {
        queryCache.invalidateQueries(['integration', vars.id, vars.project]);
      },
    }
  );
};
