import {
  isDevelopment,
  isPR,
  isStaging,
} from 'models/charts/config/utils/environment';

const stagePart = () => {
  if (isStaging) return 'Staging';
  if (isDevelopment) return 'Development';
  if (isPR) return 'Pull Request';
  return '';
};

export default stagePart;
