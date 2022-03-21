import {
  DataElement,
  Detection,
  DetectionState,
  DetectionType,
} from 'scarlet/types';

export const getDataElementPrimaryDetection = (
  dataElement: DataElement
): Detection | undefined => {
  const detections = dataElement.detections.filter(
    (item) => item.state !== DetectionState.OMITTED
  );

  const primaryDetection = detections.find((item) => item.isPrimary);

  if (primaryDetection) return primaryDetection;

  const approvedDetection = detections.find(
    (item) =>
      item.state === DetectionState.APPROVED && item.type !== DetectionType.PCMS
  );

  if (approvedDetection) return approvedDetection;

  const nonPCMSDetection = detections.find(
    (item) => item.type !== DetectionType.PCMS
  );

  if (nonPCMSDetection) return nonPCMSDetection;

  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (pcmsDetection) return pcmsDetection;

  return undefined;
};

export const getDataElementPCMSDetection = (
  dataElement: DataElement
): Detection | undefined => {
  const detection = dataElement.detections.find(
    (item) => item.type === DetectionType.PCMS
  );
  return ['', 'N/A', undefined].includes(detection?.value)
    ? undefined
    : detection;
};

export const getDataElementValue = (
  dataElement: DataElement
): string | undefined => {
  return getDataElementPrimaryDetection(dataElement)?.value;
};

export const getIsDataElementValueAvailable = (
  data: DataElement | string = ''
): boolean => {
  const value = typeof data === 'string' ? data : getDataElementValue(data);

  return value !== null && value !== undefined && value !== '';
};
