import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { isValidDepthMeasurement } from 'domain/wells/measurements/internal/utils/isValidDepthMeasurement';

import compact from 'lodash/compact';
import uniqueId from 'lodash/uniqueId';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { convertPressure } from 'utils/units';

import { PressureUnit } from 'constants/units';

import { PressureData } from '../types';

export const adaptMeasurementDataToColumn = (
  data: DepthMeasurementWithData,
  pressureUnit: PressureUnit
): PressureData[] => {
  const { depthUnit, columns, rows } = data;

  return compact(
    columns.flatMap((column, columnIndex) => {
      return rows.map((row, rowIndex) => {
        const {
          unit: columnUnit,
          measurementType,
          measurementTypeParent,
        } = column;

        if (!measurementTypeParent) {
          return null;
        }

        const { depth: depthValue, values } = row;

        let columnValue = values[columnIndex];

        const isValid = isValidDepthMeasurement({
          depthValue,
          columnValue,
          rowIndex,
        });

        if (!isValid) {
          return null;
        }

        columnValue = convertPressure(
          columnValue,
          columnUnit,
          depthValue,
          depthUnit,
          pressureUnit
        );

        return {
          id: uniqueId('pressure-data-'),
          depth: toFixedNumberFromNumber(depthValue, Fixed.ThreeDecimals),
          value: toFixedNumberFromNumber(columnValue, Fixed.OneDecimal),
          unit: pressureUnit,
          measurementType,
          measurementTypeParent,
        };
      });
    })
  );
};
