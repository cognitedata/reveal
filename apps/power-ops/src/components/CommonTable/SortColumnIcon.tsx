import { Icon } from '@cognite/cogs.js-v9';

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
