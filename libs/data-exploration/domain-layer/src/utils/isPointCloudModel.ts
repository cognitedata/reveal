import { POINT_CLOUD_FORMAT } from '../constants';
import { OutputItem } from '../threeD';

export const isPointCloudModel = (outputs: OutputItem[]) =>
  outputs.length !== 0 &&
  outputs.some((item) => item.format === POINT_CLOUD_FORMAT);
