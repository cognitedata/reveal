import { useFlag } from '@cognite/react-feature-flags';
import { useUserCapabilities } from 'hooks/useUserCapabilities';

export const useWithExtpipes = () => {
  const isFlagIntegration = useFlag('DATA_INTEGRATIONS_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const { data: hasIntegrationsPermission, ...queryProps } =
    useUserCapabilities('extractionPipelinesAcl', 'READ');

  const withIntegrations = isFlagIntegration && hasIntegrationsPermission;
  return { data: withIntegrations, ...queryProps };
};
