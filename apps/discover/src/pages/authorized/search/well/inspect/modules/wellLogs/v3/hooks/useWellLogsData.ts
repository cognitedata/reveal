import { Unit } from 'convert-units';
import isEmpty from 'lodash/isEmpty';
import { minMax } from 'utils/number/minMax';
import { changeUnitTo } from 'utils/units';
import { getConvertibleUnit } from 'utils/units/getConvertibleUnit';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { LogData, Tuplet } from '../LogViewer/Log/interfaces';

const CURVE_DEFAULT_INVALID_VALUE = -9999;
const CURVE_BREAK_POINTS = [0, CURVE_DEFAULT_INVALID_VALUE];

/**
 * Tuplet with a `null` value to break the curve.
 * No need to worry about the first value of the tuple (0).
 */
const CURVE_BREAK_TUPLET = [0, null] as unknown as Tuplet;

export const useWellLogsData = (wellLogRowData: DepthMeasurementData) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (isEmpty(wellLogRowData.rows)) {
      return EMPTY_OBJECT as LogData;
    }

    const { depthColumn, columns, rows, depthUnit } = wellLogRowData;

    const depthValues: number[] = [];
    const columnValues: number[] = [];

    const columnsData = columns.reduce<LogData>(
      (logViewerData, column, columnIndex) => {
        const values: Tuplet[] = rows.map((row, rowIndex) => {
          const depthValueOriginal = row.depth;
          const columnValueOriginal: number = row.values[columnIndex];

          /**
           * This condition breaks the curve if an invalid value is detected.
           *
           * `0` or `-9999` in the middle of the values -> invalid
           * `0` as the first value -> valid
           * `-9999` as the first value -> invalid
           */
          if (
            (rowIndex > 0 &&
              CURVE_BREAK_POINTS.includes(columnValueOriginal)) ||
            (rowIndex === 0 &&
              columnValueOriginal === CURVE_DEFAULT_INVALID_VALUE)
          ) {
            return CURVE_BREAK_TUPLET;
          }

          const depthValue = changeUnitTo(
            depthValueOriginal,
            depthUnit.unit,
            userPreferredUnit
          );

          /**
           * Defaults to the original value if the conversion failed.
           * This is to handle the values for non-distance measurements based curves.
           * Eg: Pressure based curves, Resistivity based curves, etc.
           */
          const columnValue =
            changeUnitTo(
              columnValueOriginal,
              column.unit as Unit,
              userPreferredUnit
            ) || columnValueOriginal;

          /**
           * Returns the tuplet only if the depth value is converted successfully.
           * Returns a curve breaking tuplet otherwise.
           */
          if (depthValue) {
            depthValues.push(depthValue);
            columnValues.push(columnValue);
            return [depthValue, columnValue];
          }
          return CURVE_BREAK_TUPLET;
        });

        const [columnsMinValue, columnsMaxValue] = minMax(columnValues);

        return {
          ...logViewerData,
          [column.externalId]: {
            measurementType: column.measurementType,
            values,
            unit: getConvertibleUnit(column.unit, userPreferredUnit),
            domain: [Math.floor(columnsMinValue), Math.ceil(columnsMaxValue)],
          },
        };
      },
      {}
    );

    const [minDepthValue, maxDepthValue] = minMax(depthValues);

    const depthColumnData: LogData = {
      [depthColumn.columnExternalId]: {
        measurementType: depthColumn.type,
        values: depthValues,
        unit: userPreferredUnit,
        domain: [Math.floor(minDepthValue), Math.ceil(maxDepthValue)],
      },
    };

    return {
      ...depthColumnData,
      ...columnsData,
    };
  }, [wellLogRowData, userPreferredUnit]);
};
