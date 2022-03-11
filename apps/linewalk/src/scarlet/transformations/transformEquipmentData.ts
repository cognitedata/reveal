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
  EquipmentComponentType,
  DetectionState,
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

  const created = equipmentState?.created || Date.now();
  const isApproved = equipmentState?.isApproved || false;

  return { created, isApproved, type, equipmentElements, components };
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

      const pcmsDetection = getPCMSDetection(key, pcms);

      const detections = mergeDetections(
        savedElement?.detections,
        itemScannerDetections,
        pcmsDetection
      );

      return {
        ...savedElement,
        ...config.equipmentElements[key], // -TODO: remove it later. it's here so prod may work as it uses the same equipment-state-json as staging.
        origin: DataElementOrigin.EQUIPMENT,
        detections,
        state: savedElement?.state || DataElementState.PENDING,
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
    ? detections.map((item) => ({
        ...item,
        documentExternalId,
      }))
    : detections;

const mergeDetections = (
  detections: Detection[] = [],
  scannerDetections: Detection[] = [],
  pcmsDetection?: Detection
) => {
  const lockedDetections = detections.filter(
    (d) =>
      d.type === DetectionType.MANUAL ||
      d.type === DetectionType.PCMS ||
      d.isModified
  );
  const newScannerDetections = scannerDetections.filter((sd) =>
    lockedDetections.every((d) => !isSameDetection(sd, d))
  );

  const mergedDetections = [...lockedDetections, ...newScannerDetections];

  if (pcmsDetection) {
    const prevPCMSDetection = mergedDetections.find(
      (d) => d.type === DetectionType.PCMS
    );
    if (prevPCMSDetection) {
      if (prevPCMSDetection.state !== DetectionState.APPROVED) {
        prevPCMSDetection.value = pcmsDetection.value;
      }
    } else {
      mergedDetections.unshift(pcmsDetection);
    }
  }

  return mergedDetections;
};

const getInitializedEquipmentComponents = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: Detection[] = [],
  pcmsComponents?: Metadata[]
): EquipmentComponent[] => {
  // if pcms components are not available
  if (!pcmsComponents) {
    return getInitializedEquipmentComponentsByScannerDetections(
      equipmentType,
      config,
      scannerDetections
    );
  }

  return getInitializedEquipmentComponentsByPCMS(
    equipmentType,
    config,
    scannerDetections,
    pcmsComponents
  );
};

const getInitializedEquipmentComponentsByScannerDetections = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: Detection[] = []
): EquipmentComponent[] => {
  const components: EquipmentComponent[] = [];

  const groupedDetections = scannerDetections.reduce(
    (result, detection) => {
      if (!detection.scannerComponent) return result;
      const id =
        detection.scannerComponent.type + detection.scannerComponent.id;
      if (!result[id]) {
        // eslint-disable-next-line no-param-reassign
        result[id] = {
          ...detection.scannerComponent,
          componentDetections: [],
        };
      }
      result[id].componentDetections.push(detection);
      return result;
    },
    {} as {
      [key: string]: {
        id: string;
        type: EquipmentComponentType;
        componentDetections: Detection[];
      };
    }
  );

  Object.values(groupedDetections).forEach(({ type, componentDetections }) => {
    pushComponent({
      components,
      equipmentType,
      componentType: type,
      config,
      componentDetections,
    });
  });

  return components;
};

const getInitializedEquipmentComponentsByPCMS = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: Detection[] = [],
  pcmsComponents: Metadata[] = []
): EquipmentComponent[] => {
  const components: EquipmentComponent[] = [];

  pcmsComponents.forEach((pcmsComponent) => {
    const pcmsType = pcmsComponent.component_master.toLowerCase();

    const componentType = Object.values(EquipmentComponentType).find(
      (item: EquipmentComponentType) => pcmsType.includes(item)
    );
    if (!componentType) return;

    const componentDetections = scannerDetections.filter(
      (detection) =>
        detection.scannerComponent &&
        detection.scannerComponent?.type === componentType
    );

    pushComponent({
      components,
      equipmentType,
      componentType,
      config,
      pcmsComponent,
      componentDetections,
    });
  });

  return components;
};

const pushComponent = ({
  components,
  equipmentType,
  componentType,
  config,
  pcmsComponent,
  componentDetections,
}: {
  components: EquipmentComponent[];
  equipmentType: EquipmentType;
  componentType: EquipmentComponentType;
  config: EquipmentConfig;
  pcmsComponent?: Metadata;
  componentDetections: Detection[];
}) => {
  const configComponentTypes = Object.values(
    config.equipmentTypes[equipmentType].componentTypes
  );

  const componentConfig = configComponentTypes.find(
    (item) => item.type === componentType
  );

  if (!componentConfig) return;

  const componentId = uuid();

  const componentElements = componentConfig.componentElementKeys.map(
    (dataElementKey): DataElement | undefined => {
      const detections = componentDetections.filter(
        (detection) => detection.key === dataElementKey
      );

      const pcmsDetection = getPCMSDetection(dataElementKey, pcmsComponent);
      if (pcmsDetection) {
        detections.unshift(pcmsDetection);
      }

      const dataElement: DataElement = {
        key: dataElementKey,
        origin: DataElementOrigin.COMPONENT,
        state: DataElementState.PENDING,
        detections,
        componentId,
      };

      // eslint-disable-next-line consistent-return
      return dataElement;
    }
  ) as DataElement[];

  components.push({
    id: componentId,
    pcmsName: pcmsComponent?.name,
    type: componentConfig.type,
    componentElements,
  });
};

const getPCMSDetection = (key: string, pcms?: { [key: string]: string }) => {
  if (!pcms || pcms[key] === undefined) return undefined;

  return {
    id: uuid(),
    key,
    type: DetectionType.PCMS,
    value: pcms[key],
    status: DetectionState.APPROVED,
  };
};
