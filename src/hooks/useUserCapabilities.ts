import { useCapabilities } from '@cognite/sdk-react-query-hooks'; // eslint-disable-line

export const useUserCapabilities = (
  capabilityName: string,
  actionName: string
) => {
  const { data: capabilities, ...queryProps } = useCapabilities();
  const capabilityItems = capabilities?.filter(
    ({ acl }) => acl === capabilityName
  );
  const hasCapability = capabilityItems?.some(({ actions }) =>
    actions.includes(actionName)
  );

  return { data: Boolean(hasCapability), ...queryProps };
};
