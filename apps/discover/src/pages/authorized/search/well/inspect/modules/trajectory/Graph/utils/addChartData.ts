import { Datum } from 'plotly.js';

import { SequenceColumn } from '@cognite/sdk';

import { UserPreferredUnit } from 'constants/units';
import { TrajectoryRow, TrajectoryRows } from 'modules/wellSearch/types';
import { getDataPointInPreferredUnit } from 'modules/wellSearch/utils/trajectory';

import {
  AddData,
  DataContainer,
  DimensionType,
  ThreeDCoordinate,
} from '../types';

export const addLineData = ({
  row,
  chartData,
  columnData,
  selectedTrajectoryData,
  userPreferredUnit,
  normalizeColumns,
}: AddData): ThreeDCoordinate<Datum> => {
  const x = getDataPoint(
    row,
    chartData.x,
    selectedTrajectoryData,
    DimensionType.TWOD,
    userPreferredUnit,
    columnData,
    normalizeColumns
  );
  const y = getDataPoint(
    row,
    chartData.y,
    selectedTrajectoryData,
    DimensionType.TWOD,
    userPreferredUnit,
    columnData,
    normalizeColumns
  );

  return {
    x,
    y,
    z: undefined,
  };
};

export const add3DLineData = ({
  row,
  chartData,
  columnData,
  selectedTrajectoryData,
  userPreferredUnit,
  normalizeColumns,
}: AddData): ThreeDCoordinate<Datum> => {
  const x = getDataPoint(
    row,
    chartData.x,
    selectedTrajectoryData,
    DimensionType.THREED,
    userPreferredUnit,
    columnData,
    normalizeColumns
  );

  const y = getDataPoint(
    row,
    chartData.y,
    selectedTrajectoryData,
    DimensionType.THREED,
    userPreferredUnit,
    columnData,
    normalizeColumns
  );

  const z = getDataPoint(
    row,
    chartData.z || '',
    selectedTrajectoryData,
    DimensionType.THREED,
    userPreferredUnit,
    columnData,
    normalizeColumns
  );

  return {
    x,
    y,
    z,
  };
};

export const getDataPoint = (
  row: TrajectoryRow,
  accessor: string,
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  dimentionType: DimensionType,
  preferredUnit?: UserPreferredUnit,
  columnData?: SequenceColumn[],
  normalizeColumns?: Record<string, string>
): DataContainer<Datum> => {
  try {
    const data = getDataPointInPreferredUnit(
      row,
      accessor,
      selectedTrajectoryData,
      preferredUnit,
      columnData,
      normalizeColumns
    );
    return {
      dimentionType,
      data,
    };
  } catch (error) {
    return {
      dimentionType,
      data: undefined,
      error: {
        message: `Error acquiring data for ${accessor}`,
      },
    };
  }
};

export const getArrayCoordinatesForChartType = ({
  chartType,
  row,
  chartData,
  columnData,
  selectedTrajectoryData,
  userPreferredUnit,
  normalizeColumns,
}: AddData & { chartType: string | undefined }) => {
  if (chartType === '3d') {
    return add3DLineData({
      row,
      chartData,
      columnData,
      selectedTrajectoryData,
      userPreferredUnit,
      normalizeColumns,
    });
  }
  return addLineData({
    row,
    chartData,
    columnData,
    selectedTrajectoryData,
    userPreferredUnit,
    normalizeColumns,
  });
};
