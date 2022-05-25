import { Asset } from '@cognite/sdk';
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
  DetectionType,
  DetectionState,
  ScannerDetection,
  EquipmentComponent,
  EquipmentComponentType,
  MALData,
  MSData,
} from 'scarlet/types';

export const transformEquipmentData = ({
  config,
  scannerDetections = [],
  equipmentState,
  pcms,
  mal,
  ms,
  type,
}: {
  config?: EquipmentConfig;
  scannerDetections?: ScannerDetection[];
  equipmentState?: EquipmentData;
  pcms?: PCMSData;
  mal?: MALData;
  ms?: MSData;
  type?: EquipmentType;
}): EquipmentData | undefined => {
  if (!type || !config || !config.equipmentTypes[type]) return undefined;

  const equipmentElements = getEquipmentElements(
    type,
    config,
    scannerDetections,
    equipmentState?.equipmentElements,
    pcms?.equipment,
    mal,
    ms
  );

  const equipmentComponents = getEquipmentComponents(
    type,
    config,
    scannerDetections,
    equipmentState?.components,
    pcms?.components,
    mal,
    ms
  );

  const created = equipmentState?.created || Date.now();

  return {
    created,
    type,
    equipmentElements,
    components: equipmentComponents,
  };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: ScannerDetection[] = [],
  equipmentStateElements: DataElement[] = [],
  pcms?: Asset,
  mal?: MALData,
  ms?: MSData
): DataElement[] => {
  const equipmentTypeData = config.equipmentTypes[type];

  if (!equipmentTypeData)
    throw Error(`Equipment type "${type}" is not set in configuration`);

  const { equipmentElementKeys } = equipmentTypeData;

  const equipmentElements = equipmentElementKeys
    .map((key) => {
      if (!config.equipmentElements[key]) return undefined;

      const itemScannerDetections = scannerDetections.filter(
        (detection) =>
          detection.key === key &&
          detection.boundingBox &&
          !detection.scannerComponent
      );

      const equipmentStateElement = equipmentStateElements.find(
        (item) => item.key === key
      );

      const pcmsDetection = getPCMSDetection(key, pcms);
      const malDetection = getMALDetection(key, mal);
      const msDetection = getMSDetection(key, ms);

      const detections = mergeDetections(
        equipmentStateElement?.detections,
        itemScannerDetections,
        pcmsDetection,
        malDetection,
        msDetection
      );

      return {
        ...equipmentStateElement,
        id: equipmentStateElement?.id || uuid(),
        key,
        origin: DataElementOrigin.EQUIPMENT,
        detections,
        state: equipmentStateElement?.state ?? DataElementState.PENDING,
      } as DataElement;
    })
    .filter((item) => item);

  return equipmentElements as DataElement[];
};

const getPCMSDetection = (key: string, pcms?: Asset) => {
  if (!pcms?.metadata || pcms.metadata[key] === undefined) return undefined;

  return {
    id: uuid(),
    type: DetectionType.PCMS,
    value: pcms.metadata[key].trim(),
    state: DetectionState.APPROVED,
  } as Detection;
};

const getMALDetection = (key: string, mal?: MALData) => {
  if (!mal || mal[key] === undefined || mal[key] === '') return undefined;

  return {
    id: uuid(),
    type: DetectionType.MAL,
    value: mal[key].toString().trim(),
    state: DetectionState.APPROVED,
  } as Detection;
};

const getMSDetection = (key: string, ms?: MSData) => {
  if (!ms || ms[key] === undefined || ms[key] === '') return undefined;

  return {
    id: uuid(),
    type: DetectionType.MS2,
    value: ms[key].toString().trim(),
    state: DetectionState.APPROVED,
  } as Detection;
};

const mergeDetections = (
  equipmentStateDetections: Detection[] = [],
  scannerDetections: ScannerDetection[] = [],
  pcmsDetection?: Detection,
  malDetection?: Detection,
  msDetection?: Detection
) => {
  const detections = [...equipmentStateDetections];

  // update pcms detection if it's not primary,
  // otherwise add it
  if (pcmsDetection) {
    const existingPCMSDetection = detections.find(
      (detection) => detection.type === DetectionType.PCMS
    );
    if (!existingPCMSDetection) {
      detections.push(pcmsDetection);
    } else if (!existingPCMSDetection.isPrimary) {
      existingPCMSDetection.value = pcmsDetection.value;
    }
  }

  // add scanner detections if there are no detections approved or omitted
  if (
    !detections.some((detection) => detection.type === DetectionType.SCANNER)
  ) {
    detections.push(...scannerDetections);
  }

  if (malDetection) {
    const existingMALDetection = detections.find(
      (detection) => detection.type === DetectionType.MAL
    );
    if (!existingMALDetection) {
      detections.push(malDetection);
    } else if (!existingMALDetection.isPrimary) {
      existingMALDetection.value = malDetection.value;
    }
  }

  if (msDetection) {
    const existingMSDetection = detections.find((detection) =>
      [DetectionType.MS2, DetectionType.MS3].includes(detection.type)
    );
    if (!existingMSDetection) {
      detections.push(msDetection);
    } else if (!existingMSDetection.isPrimary) {
      existingMSDetection.value = msDetection.value;
    }
  }

  return detections;
};

const getEquipmentComponents = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: ScannerDetection[] = [],
  equipmentStateComponents?: EquipmentComponent[],
  pcmsComponents?: Asset[],
  mal?: MALData,
  ms?: MSData
) => {
  let components: EquipmentComponent[] = [];
  if (equipmentStateComponents) {
    components = equipmentStateComponents.map(
      (component: EquipmentComponent) => {
        const pcmsComponent = component.pcmsExternalId
          ? pcmsComponents?.find(
              (pcmsComponent) =>
                pcmsComponent.externalId === component.pcmsExternalId
            )
          : undefined;

        return {
          ...component,
          componentElements: getComponentElements(
            equipmentType,
            config,
            component,
            pcmsComponent,
            mal,
            ms
          ),
        };
      }
    );
  } else if (pcmsComponents) {
    components = pcmsComponents
      .map((pcmsComponent) => {
        const pcmsType = pcmsComponent.metadata?.component_master.toLowerCase();
        const componentType =
          pcmsType &&
          Object.values(EquipmentComponentType).find((item) =>
            pcmsType.includes(item)
          );

        if (!componentType) {
          console.error(`Component type ${pcmsType} can't be defined`);
          return undefined;
        }

        const component: EquipmentComponent = {
          id: uuid(),
          name: pcmsComponent.name,
          pcmsExternalId: pcmsComponent.externalId,
          type: componentType,
          componentElements: [],
        };

        component.componentElements = getComponentElements(
          equipmentType,
          config,
          component,
          pcmsComponent,
          ms
        );

        return component;
      })
      .filter((item) => item) as EquipmentComponent[];
  }

  // add scanner detections
  components.forEach((component) => {
    const scannerComponentId = getScannerComponentId(component);
    const componentIdsToSkip = !scannerComponentId
      ? components
          .filter(
            (item) => item.type === component.type && item.id !== component.id
          )
          .reduce((list, component) => {
            const scannerComponentId = getScannerComponentId(component);
            if (scannerComponentId) list.push(scannerComponentId);

            return list;
          }, [] as string[])
      : [];

    const scannerComponentDetections = scannerDetections.filter(
      (detection) =>
        detection.scannerComponent &&
        detection.scannerComponent?.type === component.type &&
        (!scannerComponentId ||
          detection.scannerComponent.id === scannerComponentId) &&
        !componentIdsToSkip.includes(detection.scannerComponent.id)
    );

    component.componentElements.forEach((dataElement) => {
      const isScannerDetectionAvailable = dataElement.detections.some(
        (detection) => detection.type === DetectionType.SCANNER
      );
      if (isScannerDetectionAvailable) return;

      const scannerDataElementDetections = scannerComponentDetections.filter(
        (detection) => detection.key === dataElement.key
      );
      if (scannerDataElementDetections) {
        // eslint-disable-next-line no-param-reassign
        dataElement.detections = [
          ...dataElement.detections,
          ...scannerDataElementDetections,
        ];
      }
    });
  });

  return components;
};

const getComponentElements = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  component: EquipmentComponent,
  pcmsComponent?: Asset,
  mal?: MALData,
  ms?: MSData
): DataElement[] => {
  const configComponentTypes = Object.values(
    config.equipmentTypes[equipmentType].componentTypes
  );

  const componentConfig = configComponentTypes.find(
    (item) => item.type === component.type
  );

  if (!componentConfig)
    throw Error(
      `Component config is not set for ${equipmentType}:${component.type}`
    );

  const componentElements = componentConfig.componentElementKeys.map(
    (dataElementKey): DataElement =>
      component.componentElements.find(
        (element) => element.key === dataElementKey
      ) || {
        id: uuid(),
        key: dataElementKey,
        origin: DataElementOrigin.COMPONENT,
        state: DataElementState.PENDING,
        detections: [],
        componentId: component.id,
      }
  );

  componentElements.forEach((dataElement) => {
    const pcmsDetection = getPCMSDetection(dataElement.key, pcmsComponent);

    if (pcmsDetection) {
      const existingPCMSDetection = dataElement.detections.find(
        (detection) => detection.type === DetectionType.PCMS
      );

      if (!existingPCMSDetection) {
        dataElement.detections.unshift(pcmsDetection);
      } else if (!existingPCMSDetection.isPrimary) {
        existingPCMSDetection.value = pcmsDetection.value;
      }
    }

    const malDetection = getMALDetection(dataElement.key, mal);

    if (malDetection) {
      const existingMALDetection = dataElement.detections.find(
        (detection) => detection.type === DetectionType.MAL
      );
      if (!existingMALDetection) {
        dataElement.detections.push(malDetection);
      } else if (!existingMALDetection.isPrimary) {
        existingMALDetection.value = malDetection.value;
      }
    }

    const msDetection = getMSDetection(dataElement.key, ms);
    if (msDetection) {
      const existingMSDetection = dataElement.detections.find((detection) =>
        [DetectionType.MS2, DetectionType.MS3].includes(detection.type)
      );
      if (!existingMSDetection) {
        dataElement.detections.push(msDetection);
      } else if (!existingMSDetection.isPrimary) {
        existingMSDetection.value = msDetection.value;
      }
    }
  });

  return componentElements;
};

const getScannerComponentId = (component: EquipmentComponent) =>
  component.componentElements
    .flatMap((dataElement) => dataElement.detections)
    .find(
      (detection) =>
        detection.state === DetectionState.APPROVED &&
        detection.scannerComponent?.id
    )?.scannerComponent?.id;
