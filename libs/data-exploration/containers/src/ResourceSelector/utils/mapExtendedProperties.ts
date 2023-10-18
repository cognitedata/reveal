import { ExtendedResourceItem, ResourceItem } from '@data-exploration-lib/core';

export const mapExtendedProperties = (
  dateRange: Record<number, [Date, Date]>,
  selectedItem: ResourceItem,
  prevState?: Record<number, ExtendedResourceItem>
) => {
  if (!dateRange[selectedItem.id]) return prevState;

  if (prevState && prevState[selectedItem.id]) {
    return {
      ...prevState,
      [selectedItem.id]: {
        ...prevState[selectedItem.id],
        dateRange: dateRange[selectedItem.id],
      },
    };
  }

  return {
    ...prevState,
    [selectedItem.id]: {
      ...selectedItem,
      dateRange: dateRange[selectedItem.id],
    },
  };
};
