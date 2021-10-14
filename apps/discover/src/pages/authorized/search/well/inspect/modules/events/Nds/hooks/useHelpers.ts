import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { getNdsEventTableColumns } from 'pages/authorized/search/well/inspect/modules/events/Nds/utils';

export const useGetNdsTableColumns = () =>
  getNdsEventTableColumns(useUserPreferencesMeasurement());
