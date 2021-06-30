// MaybeDo: Move to '@cognite/sdk-react-query-hooks'
import { AclAction } from 'model/AclAction';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';

export const useOneOfPermissions = (oneOf: AclAction[]) => {
  const capabilities = useCapabilities();
  const hasPermission = oneOf.some((aclAction) => {
    const acl = capabilities.data?.find((c) => c.acl === aclAction.acl);
    return (
      !!acl &&
      (aclAction.action
        ? !!acl?.actions.find(
            (a) => a.toLowerCase() === aclAction.action.toLowerCase()
          )
        : true)
    );
  });

  return {
    ...capabilities,
    data: hasPermission,
  };
};
