import { DataFetchMode, DataFetchOptions } from '../../../types';
import { DEFAULT_RAW_DATAPOINTS_LIMIT } from '../constants';

interface Props {
  numberOfPoints: number;
  dataFetchOptions?: DataFetchOptions;
  isString?: boolean;
}

export const getDataFetchMode = ({
  numberOfPoints,
  dataFetchOptions = {} as DataFetchOptions,
  isString,
}: Props): DataFetchMode => {
  if (isString) {
    return 'raw';
  }

  const { mode, rawDatapointsLimit = DEFAULT_RAW_DATAPOINTS_LIMIT } =
    dataFetchOptions;

  if (mode && mode !== 'auto') {
    return mode;
  }

  if (numberOfPoints > rawDatapointsLimit) {
    return 'aggregate';
  }

  return 'raw';
};
