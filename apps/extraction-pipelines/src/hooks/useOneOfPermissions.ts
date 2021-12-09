// MaybeDo: Move to '@cognite/sdk-react-query-hooks'
import { AclAction } from 'model/AclAction';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';

export const useOneOfPermissions = (wantedAclActions: AclAction[]) => {
  const capabilitiesResult = useCapabilities();
  const capabilities = capabilitiesResult.data;
  const hasPermission: boolean =
    capabilities != null &&
    wantedAclActions.some((wantedAclAction) =>
      capabilities
        .filter((c) => c.acl === wantedAclAction.acl)
        .some((acl) =>
          acl.actions.some(
            (a) => a.toLowerCase() === wantedAclAction.action.toLowerCase()
          )
        )
    );

  return {
    ...capabilitiesResult,
    data: hasPermission,
  };
};
