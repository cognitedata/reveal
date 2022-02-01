import { DataElement, DetectionState } from 'scarlet/types';

export const getDataElementValue = (
  dataElement: DataElement
): string | undefined => {
  const approvedDetection = dataElement.detections.find(
    (item) => item.state === DetectionState.APPROVED
  );
  if (approvedDetection) return approvedDetection.value;

  return (
    dataElement.detections.filter(
      (item) => item.state !== DetectionState.OMITTED
    )[0]?.value ?? undefined
  );
};
