import { DataElement, DetectionState, DetectionType } from 'scarlet/types';

export const getDataElementValue = (
  dataElement: DataElement
): string | undefined => {
  const approvedDetection = dataElement.detections.find(
    (item) => item.state === DetectionState.APPROVED
  );
  if (approvedDetection) return approvedDetection.value;

  return (
    dataElement.detections.filter(
      (item) =>
        item.state !== DetectionState.OMITTED &&
        item.type !== DetectionType.PCMS
    )[0]?.value ?? undefined
  );
};
