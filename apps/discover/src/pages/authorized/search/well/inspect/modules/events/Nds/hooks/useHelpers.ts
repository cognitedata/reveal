import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { getNdsEventTableColumns } from 'pages/authorized/search/well/inspect/modules/events/Nds/utils';

export const useGetNdsTableColumns = () =>
  getNdsEventTableColumns(useUserPreferencesMeasurement());
