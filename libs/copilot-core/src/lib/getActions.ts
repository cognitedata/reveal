import { getActionsForStreamlit } from './features/streamlit/getActions';
import { CopilotSupportedFeatureType, GetActionsFunc } from './types';

export const getActions = async (
  feature: CopilotSupportedFeatureType | undefined,
  ...params: Parameters<GetActionsFunc>
) => {
  switch (feature) {
    case 'Streamlit':
      return getActionsForStreamlit(...params);
    default: {
      return [];
    }
  }
};
