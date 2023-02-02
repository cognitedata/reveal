import { ConvertedDistance } from 'utils/units/constants';

export const visualizeDistance = (distance?: ConvertedDistance) => {
  if (!distance) {
    return 'N/A';
  }

  return `${distance.value} ${distance.unit}`;
};
