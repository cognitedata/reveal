import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { includesAny } from 'utils/filter/includesAny';
import { withoutNil } from 'utils/withoutNil';

import { measurementTypes } from '../hooks/useMudWeightMeasurements';
import { DepthMeasurementWithData } from '../types';

export const filterMudWeightData = (
  data: DepthMeasurementWithData[]
): DepthMeasurementWithData[] => {
  return compact(
    data.map((measurement) => {
      const mudWeightColumns = measurement.columns.map((column) => {
        if (includesAny(column.measurementType, measurementTypes)) {
          return column;
        }
        return null;
      });

      const columns = compact(mudWeightColumns);

      if (isEmpty(columns)) {
        return null;
      }

      const columnIndices = withoutNil(
        mudWeightColumns.map((column, index) => {
          if (column) {
            return index;
          }
          return null;
        })
      );

      const rows = measurement.rows.map((row) => {
        const values = columnIndices.map(
          (columnIndex) => row.values[columnIndex]
        );
        return { ...row, values };
      });

      return {
        ...measurement,
        columns,
        rows,
      };
    })
  );
};
