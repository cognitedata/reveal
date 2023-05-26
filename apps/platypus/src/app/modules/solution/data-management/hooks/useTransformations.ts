import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

export default function useTransformations({
  space,
  isEnabled,
  typeName,
  version,
}: {
  space: string;
  isEnabled: boolean;
  typeName: string;
  version: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const query = useQuery(
    QueryKeys.TRANSFORMATION(space, typeName, version),
    async () => {
      return dataManagementHandler.getTransformations({
        spaceExternalId: space,
        instanceSpaceExternalId: space,
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
