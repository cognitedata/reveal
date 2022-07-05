import { DataElement, DetectionType, EquipmentElementKey } from 'types';

import { getDataElementPrimaryDetection, getDataElementPCMSDetection } from '.';

const identicalValuesConfig = [
  {
    keys: [EquipmentElementKey.OPERATING_STATUS],
    values: ['in service', 'active'],
  },
  {
    keys: [EquipmentElementKey.CLASS],
    values: ['n/a', '(n/a)', 'class not applicable'],
  },
];

const identicalValuesConfigByKey = identicalValuesConfig.reduce(
  (result, rule) =>
    rule.keys.reduce((ruleResult, key) => {
      ruleResult[key].push(rule.values);
      return ruleResult;
    }, result),
  identicalValuesConfig
    .flatMap((rule) => rule.keys)
    .reduce(
      (result, key) => ({
        ...result,
        // add default values here if needed
        [key]: [],
      }),
      {} as Record<string, string[][]>
    )
);

export const getDataElementHasDiscrepancy = (
  dataElement: DataElement
): boolean => {
  const primaryDetection = getDataElementPrimaryDetection(dataElement);
  if (!primaryDetection || primaryDetection.type === DetectionType.PCMS) {
    return false;
  }

  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (!pcmsDetection) return false;

  const pcmsValue = pcmsDetection.value?.toLowerCase() ?? '';
  const primaryValue = primaryDetection.value?.toLocaleLowerCase() ?? '';

  if (
    dataElement.key === EquipmentElementKey.MANUFACTURER &&
    isIdenticalManufacture(pcmsValue, primaryValue)
  ) {
    return false;
  }

  return (
    primaryValue !== pcmsValue &&
    !identicalValuesConfigByKey[dataElement.key]?.some(
      (identicalValues) =>
        identicalValues.includes(primaryValue) &&
        identicalValues.includes(pcmsValue)
    )
  );
};

const isIdenticalManufacture = (pcmsValue: string, primaryValue: string) =>
  pcmsValue.includes(primaryValue);
