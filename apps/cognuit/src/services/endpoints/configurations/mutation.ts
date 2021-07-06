import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useContext } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { CONFIGURATIONS_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';

const useConfigurationsMutation = () => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);
  const queryCache = useQueryClient();

  const defaultConfigs = {
    onSuccess: () => {
      queryCache.invalidateQueries(CONFIGURATIONS_KEYS.default);
      removeError();
    },
    onError: (error: CustomError) => {
      addError(error.message, error.status);
    },
  };

  const createConfigurations = useMutation((data: any) => {
    return api!.configurations.create(data);
  });

  const updateConfigurations = useMutation(
    ({ id, name }: { id: number; name: string }) => {
      return api!.configurations.update(id, { name });
    },
    defaultConfigs
  );

  const startOrStopConfigurations = useMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) => {
      return api!.configurations.startOrStopConfiguration(id, isActive);
    },
    defaultConfigs
  );

  const restartConfigurations = useMutation(({ id }: { id: number }) => {
    return api!.configurations.restart(id);
  }, defaultConfigs);

  return {
    createConfigurations,
    updateConfigurations,
    startOrStopConfigurations,
    restartConfigurations,
  };
};

export { useConfigurationsMutation };
