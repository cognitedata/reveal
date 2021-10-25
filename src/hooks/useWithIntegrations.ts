import { useFlag } from '@cognite/react-feature-flags';
import { useUserCapabilities } from 'hooks/useUserCapabilities';

export const useWithIntegrations = (): boolean => {
  const isFlagIntegration = useFlag('DATA_INTEGRATIONS_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const { data: hasIntegrationsPermission } = useUserCapabilities(
    'extractionPipelinesAcl',
    'READ'
  );

  const withIntegrations = isFlagIntegration && hasIntegrationsPermission;
  return withIntegrations;
};
