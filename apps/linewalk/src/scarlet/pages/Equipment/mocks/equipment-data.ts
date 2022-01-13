import {
  DataElementBoundingBox,
  DataElement,
  EquipmentElementKey,
  EquipmentData,
} from 'scarlet/types';

const DOC_MIN_X = 740;
const DOC_MIN_Y = 25;
const DOC_MAX_X = 1820;
const DOC_MAX_Y = 1412;

const docWidth = DOC_MAX_X - DOC_MIN_X;
const docHeight = DOC_MAX_Y - DOC_MIN_Y;

const getBoundingBox = ({
  x,
  y,
  width,
  height,
}: DataElementBoundingBox): DataElementBoundingBox => {
  return {
    x: (x - DOC_MIN_X) / docWidth,
    y: (y - DOC_MIN_Y) / docHeight,
    width: width / docWidth,
    height: height / docHeight,
  };
};

const mockEquipmentElement = (
  data: EquipmentData,
  element: Partial<DataElement>
) => {
  const { equipmentElements } = data!;
  const index = (equipmentElements || []).findIndex(
    (item) => item.scannerKey === element.scannerKey
  );

  if (index > -1) {
    equipmentElements[index] = {
      ...equipmentElements[index],
      ...element,
    };
  }
};

export const mockEquipmentData = (data: EquipmentData): EquipmentData => {
  if (!data) return data;

  mockEquipmentElement(data, {
    scannerKey: EquipmentElementKey.MAX_ALLOW_WRK_PRES,
    boundingBox: getBoundingBox({
      x: 900,
      y: 660,
      width: 70,
      height: 18,
    }),
    value: 460,
    sourceDocumentId: 2781531843234896,
    pageNumber: 1,
  });

  return data;
};
