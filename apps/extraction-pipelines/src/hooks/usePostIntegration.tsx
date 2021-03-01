import { useMutation } from 'react-query';
import { ErrorVariations } from '../model/SDKErrors';
import { Integration, RegisterIntegrationInfo } from '../model/Integration';
import { registerIntegration } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';

interface Props {
  integrationInfo: Partial<RegisterIntegrationInfo>;
}
export const usePostIntegration = () => {
  const { project } = useAppEnv();
  return useMutation<Integration, ErrorVariations, Props>(
    ({ integrationInfo }) => {
      return registerIntegration(project ?? '', integrationInfo);
    }
  );
};
