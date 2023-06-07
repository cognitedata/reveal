import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

export default function useTransformations({
  space,
  isEnabled,
  typeName,
  viewVersion,
}: {
  space: string;
  isEnabled: boolean;
  typeName: string;
  viewVersion: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const query = useQuery(
    QueryKeys.TRANSFORMATION(space, typeName, viewVersion),
    async () => {
      return dataManagementHandler.getTransformations({
        spaceExternalId: space,
        instanceSpaceExternalId: space,
        typeName,
        viewVersion,
      });
    },
    {
      enabled: !typeName.includes('undefined') && isEnabled,
    }
  );

  return query;
}
