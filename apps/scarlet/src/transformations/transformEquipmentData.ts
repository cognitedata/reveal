import { Asset } from '@cognite/sdk';
import { v4 as uuid } from 'uuid';
import {
  BooleanDetectionValue,
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
  DataElementType,
  EquipmentComponentType,
} from 'types';
import {
  getDataElementConfig,
  parseDate,
  getComponentTypeOfPcmsType,
  getEquipmentType,
} from 'utils';

const PCMS_TYPE_KEY = 'Component Type(API)';

export const transformEquipmentData = ({
  config,
  scannerDetections,
  equipmentState,
  pcms,
}: {
  config?: EquipmentConfig;
  scannerDetections?: {
    annotationsVersion?: string;
    annotations: ScannerDetection[];
  };
  equipmentState?: EquipmentData;
  pcms?: PCMSData;
}): EquipmentData | undefined => {
  const typeName = pcms?.equipment?.metadata?._typeName ?? ''; // eslint-disable-line no-underscore-dangle
  const type = getEquipmentType(typeName);
  if (!type || !config || !config.equipmentTypes[type]) return undefined;

  const equipmentElements = getEquipmentElements(
    type,
    config,
    scannerDetections?.annotations || [],
    equipmentState?.equipmentElements
  );

  const equipmentComponents = getEquipmentComponents(
    type,
    config,
    scannerDetections?.annotations || [],
    equipmentState?.components,
    pcms?.components
  );

  const created = equipmentState?.created || Date.now();

  return {
    created,
    type,
    typeName,
    equipmentElements,
    components: equipmentComponents,
    latestAnnotations:
      scannerDetections?.annotationsVersion === config.creatingAppVersions[0],
  };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: ScannerDetection[] = [],
  equipmentStateElements: DataElement[] = []
): DataElement[] => {
  const equipmentTypeData = config.equipmentTypes[type];

  if (!equipmentTypeData)
    throw Error(`Equipment type "${type}" is not set in configuration`);

  const { equipmentElementKeys } = equipmentTypeData;

  const equipmentElements = equipmentElementKeys
    .map((key) => {
      const dataElementConfig = getDataElementConfig(config, key, type);
      if (!dataElementConfig) return undefined;

      const itemScannerDetections = scannerDetections
        .filter(
          (detection) =>
            detection.key === key &&
            detection.boundingBox &&
            !detection.scannerComponent
        )
        .map((detection) =>
          transformDetection(detection, dataElementConfig.type)
        ) as ScannerDetection[];

      const equipmentStateElement = equipmentStateElements.find(
        (item) => item.key === key
      );

      const equipmentStateDetections = equipmentStateElement?.detections.map(
        (detection) => transformDetection(detection, dataElementConfig.type)
      );

      const detections = mergeDetections(
        equipmentStateDetections,
        itemScannerDetections
      );

      return {
        ...equipmentStateElement,
        id: equipmentStateElement?.id || uuid(),
        key,
        origin: DataElementOrigin.EQUIPMENT,
        detections,
        state: equipmentStateElement?.state ?? DataElementState.PENDING,
        config: dataElementConfig,
      } as DataElement;
    })
    .filter((item) => item);

  return equipmentElements as DataElement[];
};

const mergeDetections = (
  equipmentStateDetections: Detection[] = [],
  scannerDetections: ScannerDetection[] = []
) => {
  const detections = [...equipmentStateDetections];

  // add scanner detections if there are no detections approved or omitted
  if (
    !detections.some((detection) => detection.type === DetectionType.SCANNER)
  ) {
    detections.push(...scannerDetections);
  }

  return detections;
};

const getEquipmentComponents = (
  equipmentType: EquipmentType,
  config: EquipmentConfig,
  scannerDetections: ScannerDetection[] = [],
  equipmentStateComponents?: EquipmentComponent[],
  pcmsComponents?: Asset[]
) => {
  let components: EquipmentComponent[] = [];
  if (equipmentStateComponents) {
    components = equipmentStateComponents.map(
      (component: EquipmentComponent) => {
        return {
          ...component,
          componentElements: getComponentElements(
            equipmentType,
            config,
            component
          ),
        };
      }
    );
  } else if (pcmsComponents) {
    components = pcmsComponents
      .map((pcmsComponent) => {
        const pcmsType = pcmsComponent.metadata?.[PCMS_TYPE_KEY];
        const componentType = pcmsType && getComponentTypeOfPcmsType(pcmsType);

        if (!componentType) {
          console.error(`Component type ${pcmsType} can't be defined`);
          return undefined;
        }

        const component: EquipmentComponent = {
          id: uuid(),
          name: pcmsComponent.name,
          circuitId: pcmsComponent.name,
          pcmsExternalId: pcmsComponent.externalId,
          type: componentType,
          componentElements: [],
        };

        component.componentElements = getComponentElements(
          equipmentType,
          config,
          component
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
      const dataElementConfig = config.componentElements[dataElement.key];

      if (!dataElementConfig) return;

      const isScannerDetectionAvailable = dataElement.detections.some(
        (detection) => detection.type === DetectionType.SCANNER
      );
      if (isScannerDetectionAvailable) return;

      const scannerDataElementDetections = scannerComponentDetections
        .filter((detection) => detection.key === dataElement.key)
        .map((detection) =>
          transformDetection(detection, dataElementConfig.type)
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
  component: EquipmentComponent
): DataElement[] => {
  const configComponentTypes = Object.values(
    config.equipmentTypes[equipmentType].componentTypes
  );

  const componentConfig = configComponentTypes.find(
    (item) => item.type === component.type
  );

  // With equpiment type based spec definitions, we can't guarantee a component config will be present.
  if (!componentConfig) return [];

  const componentElements = componentConfig.componentElementKeys
    .map((dataElementKey) => {
      const dataElementConfig = getDataElementConfig(
        config,
        dataElementKey,
        equipmentType,
        component.type
      );
      if (!dataElementConfig) return undefined;

      const componentElement = component.componentElements.find(
        (element) => element.key === dataElementKey
      ) || {
        id: uuid(),
        key: dataElementKey,
        origin: DataElementOrigin.COMPONENT,
        state: DataElementState.PENDING,
        detections: [],
        componentId: component.id,
      };

      return {
        ...componentElement,
        config: dataElementConfig,
      };
    })
    .filter((dataElement) => dataElement) as DataElement[];

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

const transformDetection = (
  detection: ScannerDetection | Detection,
  dataElementType?: DataElementType
) =>
  ({
    ...detection,
    value: transformDetectionValue(detection.value, dataElementType),
  } as ScannerDetection | Detection);

const transformDetectionValue = (
  value?: string | number,
  dataElementType?: DataElementType
) => {
  if (value === undefined || value === null) return value;
  const strValue = value.toString().trim();

  switch (dataElementType) {
    case DataElementType.FLOAT: {
      const parsedValue = parseFloat(strValue);
      return Number.isNaN(parsedValue) ? strValue : parsedValue.toString();
    }
    case DataElementType.INT: {
      const parsedValue = parseInt(strValue, 10);
      return Number.isNaN(parsedValue) ? strValue : parsedValue.toString();
    }
    case DataElementType.DATE:
      return parseDate(strValue);

    case DataElementType.BOOLEAN: {
      if (strValue.includes('n')) return BooleanDetectionValue.NO;
      if (strValue.includes('y')) return BooleanDetectionValue.YES;

      return strValue;
    }

    default:
      return strValue;
  }
};

export const getCourseComponents = ({
  idPrefix,
  circuitId,
  numbOfCourses,
  equipmentType,
  config,
  startIndex,
}: {
  idPrefix: string;
  circuitId: string;
  numbOfCourses: number;
  equipmentType: EquipmentType;
  config: EquipmentConfig;
  startIndex?: number;
}): EquipmentComponent[] => {
  const courseComponents = [];
  for (let i = 1; i <= numbOfCourses; i++) {
    const courseComp: EquipmentComponent = {
      id: `${idPrefix}-${uuid()}`,
      name: `Course-${startIndex ? startIndex + i : i}`,
      circuitId,
      pcmsExternalId: '',
      type: EquipmentComponentType.COURSE,
      componentElements: [],
    };
    courseComp.componentElements = getComponentElements(
      equipmentType,
      config,
      courseComp
    );
    courseComponents.push(courseComp);
  }
  return courseComponents;
};
