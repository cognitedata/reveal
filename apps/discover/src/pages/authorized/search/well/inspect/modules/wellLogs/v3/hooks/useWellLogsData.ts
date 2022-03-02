import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { minMax } from 'utils/minMax';
import { unsafeChangeUnitTo } from 'utils/units';
import { getConvertibleUnit } from 'utils/units/getConvertibleUnit';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { LogData, Tuplet } from '../LogViewer/Log/interfaces';

const CURVE_DEFAULT_INVALID_VALUE = -9999;
const CURVE_BREAK_POINTS = [0, CURVE_DEFAULT_INVALID_VALUE];

export const useWellLogsData = (wellLogRowData: DepthMeasurementData) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (isEmpty(wellLogRowData.rows)) {
      return EMPTY_OBJECT as LogData;
    }

    const { depthColumn, columns, rows, depthUnit } = wellLogRowData;
    const { unit } = depthUnit;
    const depthValues = rows.map((row) =>
      unsafeChangeUnitTo(row.depth, unit, userPreferredUnit)
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

    return columns.reduce<LogData>((logViewerData, column, columnIndex) => {
      const values: Tuplet[] = rows.map((row, rowIndex) => {
        const depthValueOriginal = row.depth;
        const columnValueOriginal = row.values[columnIndex];

        /**
         * This condition breaks the curve if an invalid value is detected.
         *
         * `0` or `-9999` in the middle of the values -> invalid
         * `0` as the first value -> valid
         * `-9999` as the first value -> invalid
         */
        if (
          (rowIndex > 0 && CURVE_BREAK_POINTS.includes(columnValueOriginal)) ||
          (rowIndex === 0 &&
            columnValueOriginal === CURVE_DEFAULT_INVALID_VALUE)
        ) {
          /**
           * Returning a `null` value to break the curve.
           * No need to worry about the first value of the tuple (0).
           */
          return [0, null] as unknown as Tuplet;
        }

        const depthValue = unsafeChangeUnitTo(
          depthValueOriginal,
          unit,
          userPreferredUnit
        );

        const columnValue = unsafeChangeUnitTo(
          columnValueOriginal,
          column.unit,
          userPreferredUnit
        );

        return [depthValue, columnValue];
      });

      const columnValues = compact(values.map((value) => value[1]));
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
    }, depthColumnData);
  }, [wellLogRowData, userPreferredUnit]);
};
