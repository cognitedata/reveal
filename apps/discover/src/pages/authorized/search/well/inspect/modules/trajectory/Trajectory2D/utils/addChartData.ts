import { getDataPointInPreferredUnit } from 'modules/wellSearch/utils/trajectory';

import { AddData } from '../types';

const addLineData = ({
  row,
  chartData,
  columnData,
  config,
  selectedTrajectoryData,
  userPreferredUnit,
}: AddData) => {
  const x = getDataPointInPreferredUnit(
    row,
    chartData.x,
    selectedTrajectoryData,
    userPreferredUnit,
    columnData,
    config
  );
  const y = getDataPointInPreferredUnit(
    row,
    chartData.y,
    selectedTrajectoryData,
    userPreferredUnit,
    columnData,
    config
  );

  return [x, y, undefined];
};

const add3DLineData = ({
  row,
  chartData,
  columnData,
  config,
  selectedTrajectoryData,
  userPreferredUnit,
}: AddData) => {
  const x = getDataPointInPreferredUnit(
    row,
    chartData.x,
    selectedTrajectoryData,
    userPreferredUnit,
    columnData,
    config
  );

  const y = getDataPointInPreferredUnit(
    row,
    chartData.y,
    selectedTrajectoryData,
    userPreferredUnit,
    columnData,
    config
  );

  const z = getDataPointInPreferredUnit(
    row,
    chartData.z || '',
    selectedTrajectoryData,
    userPreferredUnit,
    columnData,
    config
  );

  return [x, y, z];
};

// return data adding functions for different chart types.
export const getAddDataFn = (type: string | undefined) => {
  switch (type) {
    case 'line':
      return addLineData;
    case '3d':
      return add3DLineData;
    default:
      return addLineData;
  }
};
