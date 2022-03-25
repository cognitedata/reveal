import { v4 as uuid } from 'uuid';
import {
  Annotation,
  DataElement,
  Detection,
  DetectionType,
} from 'scarlet/types';

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

export const getDetection = (
  visibleDataElement: DataElement,
  detectionType: DetectionType,
  annotation?: Annotation
): Detection => ({
  id: uuid(),
  key: visibleDataElement!.key,
  type: detectionType,
  ...annotation,
});
