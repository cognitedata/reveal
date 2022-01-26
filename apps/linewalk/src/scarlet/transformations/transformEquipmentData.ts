import {
  DataElement,
  EquipmentData,
  DataElementOrigin,
  Detection,
  EquipmentConfig,
  EquipmentType,
  DataElementState,
  PCMSData,
  EquipmentDocument,
  DocumentType,
  DetectionType,
} from 'scarlet/types';
import { isSameDetection } from 'scarlet/utils';

export const transformEquipmentData = ({
  config,
  scannerDetections,
  equipmentState,
  pcms,
  documents,
  type,
}: {
  config?: EquipmentConfig;
  scannerDetections?: Detection[];
  equipmentState?: EquipmentData;
  pcms?: PCMSData;
  documents?: EquipmentDocument[];
  type?: EquipmentType;
}): EquipmentData | undefined => {
  if (!type || !config || !config.equipmentTypes[type]) return undefined;
  const equipmentElements = getEquipmentElements(
    type,
    config,
    scannerDetections,
    equipmentState?.equipmentElements,
    pcms?.equipment,
    documents
  );

  return { type, equipmentElements };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  rawScannerDetections: Detection[] = [],
  savedElements: DataElement[] = [],
  pcms: { [key: string]: string } = {},
  documents: EquipmentDocument[] = []
): DataElement[] => {
  const { equipmentElementKeys } = config.equipmentTypes[type];
  const U1Document = getU1Document(documents);
  const scannerDetections = transformScannerDetections(
    rawScannerDetections,
    U1Document?.externalId
  );

  const equipmentElements = equipmentElementKeys
    .map((key) => {
      const itemScannerDetections = scannerDetections.filter(
        (detection) => detection.key === key && detection.boundingBox
      );

      if (!config.equipmentElements[key]) return undefined;

      const savedElement = savedElements.find((item) => item.key === key);

      // do not update omitted or approved data-elements
      // only label, unit and type could be updated from config file
      if (savedElement && savedElement.state !== DataElementState.PENDING) {
        return {
          ...savedElement,
          ...config.equipmentElements[key],
        };
      }

      const { value } = itemScannerDetections[0] || {};

      const detections = mergeDetections(
        savedElement?.detections,
        itemScannerDetections
      );

      return {
        ...savedElement,
        ...config.equipmentElements[key],
        origin: DataElementOrigin.EQUIPMENT,
        value,
        detections,
        state: DataElementState.PENDING,
        pcmsValue: pcms[key],
      } as DataElement;
    })
    .filter((item) => item);

  return equipmentElements as DataElement[];
};

const getU1Document = (documents: EquipmentDocument[]) =>
  documents?.find((document) => document.type === DocumentType.U1);

const transformScannerDetections = (
  detections: Detection[],
  documentExternalId?: string
) =>
  documentExternalId
    ? detections?.map((item) => ({
        ...item,
        documentExternalId,
      }))
    : detections;

const mergeDetections = (
  detections: Detection[] = [],
  scannerDetections: Detection[] = []
) => {
  const lockedDetections = detections.filter(
    (d) => d.type === DetectionType.MANUAL || d.isModified
  );
  const newScannerDetections = scannerDetections.filter((sd) =>
    lockedDetections.every((d) => !isSameDetection(sd, d))
  );

  return [...lockedDetections, ...newScannerDetections];
};
