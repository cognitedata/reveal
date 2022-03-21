import { DataElement } from 'scarlet/types';

export const toggleDataElement = (
  checkedListOrigin: DataElement[],
  dataElement: DataElement,
  checked: boolean
): DataElement[] => {
  const checkedList = [...checkedListOrigin];

  if (checked) {
    checkedList.push(dataElement);
  } else {
    const index = checkedList.findIndex((item) => item.id === dataElement.id);
    if (index !== -1) {
      checkedList.splice(index, 1);
    }
  }

  return checkedList;
};
