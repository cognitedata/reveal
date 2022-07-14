import { colorize } from 'utils/colorize';
import { minMax } from 'utils/number/minMax';

import { WellLogPreviewData, Tuplet } from '../LogViewer/Log/types';
import { WellLogView } from '../types';

const CURVE_DEFAULT_INVALID_VALUE = -9999;
const CURVE_BREAK_POINTS = [0, CURVE_DEFAULT_INVALID_VALUE];

/**
 * Tuplet with a `null` value to break the curve.
 * No need to worry about the first value of the tuple (0).
 */
const CURVE_BREAK_TUPLET = [0, null] as unknown as Tuplet;

export const adaptToWellLogPreviewData = (
  wellLog: WellLogView
): WellLogPreviewData => {
  const { depthColumn, columns, rows } = wellLog;

  const columnExternalIds = [
    depthColumn.externalId,
    ...columns.map(({ externalId }) => externalId),
  ];
  const columnColorMap = colorize(columnExternalIds);

  const columnsData = columns.reduce<WellLogPreviewData>(
    (logViewerData, column, columnIndex) => {
      const values: Tuplet[] = rows.map(({ depth, values }, rowIndex) => {
        const columnValue = values[columnIndex];

        /**
         * This condition breaks the curve if an invalid value is detected.
         *
         * `0` or `-9999` in the middle of the values -> invalid
         * `0` as the first value -> valid
         * `-9999` as the first value -> invalid
         */
        if (
          (rowIndex > 0 && CURVE_BREAK_POINTS.includes(columnValue)) ||
          (rowIndex === 0 && columnValue === CURVE_DEFAULT_INVALID_VALUE)
        ) {
          return CURVE_BREAK_TUPLET;
        }

        return [depth, columnValue];
      });

      const columnValues = values.map(([_, columnValue]) => columnValue);
      const [columnsMinValue, columnsMaxValue] = minMax(columnValues);

      return {
        ...logViewerData,
        [column.externalId]: {
          measurementType: column.measurementType,
          values,
          unit: column.unit,
          domain: [Math.floor(columnsMinValue), Math.ceil(columnsMaxValue)],
          color: columnColorMap[column.externalId],
        },
      };
    },
    {}
  );

  const depthValues = rows.map(({ depth }) => depth);
  const [minDepthValue, maxDepthValue] = minMax(depthValues);

  const depthColumnData: WellLogPreviewData = {
    [depthColumn.externalId]: {
      measurementType: depthColumn.type,
      values: depthValues,
      unit: depthColumn.unit,
      domain: [Math.floor(minDepthValue), Math.ceil(maxDepthValue)],
      color: columnColorMap[depthColumn.externalId],
    },
  };

  return {
    ...depthColumnData,
    ...columnsData,
  };
};
