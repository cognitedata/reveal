import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { generateWellColumns } from 'pages/authorized/search/well/utils';

export const useWellResultColumns = () =>
  generateWellColumns(useUserPreferencesMeasurement());
