import isEmpty from 'lodash/isEmpty';
import { changeUnitTo } from 'utils/units';
import { getConvertibleUnit } from 'utils/units/getConvertibleUnit';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { LogData, Tuplet } from '../LogViewer/Log/interfaces';

export const useWellLogsData = (wellLogRowData: DepthMeasurementData) => {
  const userPreferredUnit = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (isEmpty(wellLogRowData?.rows)) return {};

    const { depthColumn, columns, rows, depthUnit } = wellLogRowData;
    const { unit } = depthUnit;
    const depthValues = rows.map(
      (row) => changeUnitTo(row.depth, unit, userPreferredUnit) || row.depth
    );
    const minDepthValue = Math.min(...depthValues);
    const maxDepthValue = Math.max(...depthValues);

    const depthColumnData: LogData = {
      [depthColumn.columnExternalId]: {
        measurementType: depthColumn.type,
        values: depthValues,
        unit: userPreferredUnit,
        domain: [Math.floor(minDepthValue), Math.ceil(maxDepthValue)],
      },
    };

    return columns.reduce<LogData>((logViewerData, column, columnIndex) => {
      let rowsMinValue = Number(rows[0].values[columnIndex]);
      let rowsMaxValue = Number(rows[0].values[columnIndex]);

      const values: Tuplet[] = rows.map((row) => {
        const depthValue =
          changeUnitTo(row.depth, unit, userPreferredUnit) || row.depth;
        const rowValue = row.values[columnIndex];

        if (rowValue < rowsMinValue) rowsMinValue = rowValue;
        if (rowValue > rowsMaxValue) rowsMaxValue = rowValue;

        return [depthValue, rowValue];
      });

      return {
        ...logViewerData,
        [column.externalId]: {
          measurementType: column.measurementType,
          values,
          unit: getConvertibleUnit(column.unit, userPreferredUnit),
          domain: [Math.floor(rowsMinValue), Math.ceil(rowsMaxValue)],
        },
      };
    }, depthColumnData);
  }, [wellLogRowData, userPreferredUnit]);
};
