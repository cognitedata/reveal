import { Metadata } from '@cognite/sdk';
import { v4 as uuid } from 'uuid';
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
  EquipmentComponent,
} from 'scarlet/types';
import { isSameDetection } from 'scarlet/utils';

export const transformEquipmentData = ({
  config,
  scannerDetections = [],
  equipmentState,
  pcms,
  documents = [],
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

  const U1Document = getU1Document(documents);
  const transformedScannerDetections = transformScannerDetections(
    scannerDetections,
    U1Document?.externalId
  );

  const equipmentElements = getEquipmentElements(
    type,
    config,
    transformedScannerDetections,
    equipmentState?.equipmentElements,
    pcms?.equipment
  );

  let components = equipmentState?.components;
  if (!components?.length) {
    components = getInitializedEquipmentComponents(
      type,
      config,
      transformedScannerDetections,
      pcms?.components
    );
  }

  return { type, equipmentElements, components };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: Detection[] = [],
  savedElements: DataElement[] = [],
  pcms: { [key: string]: string } = {}
): DataElement[] => {
  const { equipmentElementKeys } = config.equipmentTypes[type];

  const equipmentElements = equipmentElementKeys
    .map((key) => {
      const itemScannerDetections = scannerDetections.filter(
        (detection) =>
          detection.key === key &&
          detection.boundingBox &&
          !detection.scannerComponent
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
        ...config.equipmentElements[key], // -TODO: remove it later. it's here so prod may work as it uses the same equipment-state-json as staging.
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

const getInitializedEquipmentComponents = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: Detection[] = [],
  pcmsComponents: Metadata[] = []
): EquipmentComponent[] => {
  const resultComponents: EquipmentComponent[] = [];

  const componentTypes = Object.values(
    config.equipmentTypes[equipmentType].componentTypes
  );

  pcmsComponents.forEach((pcmsComponent) => {
    const componentId = uuid();
    const type = pcmsComponent.component_master.toLowerCase();
    const componentConfig = componentTypes.find(
      (componentType) => componentType.type === type
    );

    const componentDetections = scannerDetections.filter(
      (detection) =>
        detection.scannerComponent &&
        detection.scannerComponent?.type === componentConfig?.type
    );

    if (!componentConfig) return;

    const componentElements = componentConfig.componentElementKeys.map(
      (dataElementKey): DataElement | undefined => {
        const detections = componentDetections.filter(
          (detection) => detection.key === dataElementKey
        );
        const dataElement: DataElement = {
          key: dataElementKey,
          origin: DataElementOrigin.COMPONENT,
          state: DataElementState.PENDING,
          pcmsValue: pcmsComponent[dataElementKey],
          detections,
          componentId,
        };

        // eslint-disable-next-line consistent-return
        return dataElement;
      }
    ) as DataElement[];

    resultComponents.push({
      id: componentId,
      type: componentConfig.type,
      componentElements,
    });
  });

  return resultComponents;
};
