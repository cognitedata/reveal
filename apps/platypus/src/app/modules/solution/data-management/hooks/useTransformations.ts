import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

export default function useTransformations({
  dataModelExternalId,
  isEnabled,
  typeName,
  version,
}: {
  dataModelExternalId: string;
  isEnabled: boolean;
  typeName: string;
  version: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const query = useQuery(
    QueryKeys.TRANSFORMATION(dataModelExternalId, typeName, version),
    async () => {
      return dataManagementHandler.getTransformations({
        dataModelExternalId,
        typeName,
        version,
      });
    },
    {
      enabled: !typeName.includes('undefined') && isEnabled,
    }
  );

  return query;
}
