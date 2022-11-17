import { Icon } from '@cognite/cogs.js';

export const SortColumnIcon = ({
  isSorted,
  isSortedDesc,
}: {
  isSorted?: boolean;
  isSortedDesc?: boolean;
}) => {
  if (isSorted) {
    return isSortedDesc ? (
      <Icon type="ReorderDescending" />
    ) : (
      <Icon type="ReorderAscending" />
    );
  }
  return <Icon type="ReorderDefault" />;
};
