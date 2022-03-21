import { saveFlow } from '@cognite/auth-utils';
import { useContext } from 'react';
import { useMutation } from 'react-query';

import LoginContext from '../context';
import { validateTenant } from '../api';

const useLoginWithProjectName = (move: (project: string) => void) => {
  const { isProduction } = useContext(LoginContext);
  const mutation = useMutation(
    (params: { projectName: string; env?: string }) =>
      validateTenant(isProduction, params.projectName, params.env),
    {
      retry: 1,
      onSuccess: (_data, { projectName, env }) => {
        saveFlow('COGNITE_AUTH', undefined, projectName, env);
        move(projectName);
      },
    }
  );

  return {
    login: mutation.mutate,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
};

export default useLoginWithProjectName;
