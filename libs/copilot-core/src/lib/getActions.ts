import { CopilotSupportedFeatureType, GetActionsFunc } from './types';

export const getActions = async (
  feature: CopilotSupportedFeatureType | undefined,
  ...params: Parameters<GetActionsFunc>
) => {
  switch (feature) {
    case 'Streamlit':
      return [
        {
          type: 'GENERATE_APP',
          name: 'Generate App',
          content: 'Generate App',
          onClick: async () => {
            params[2]({
              content: 'I want to generate a new Streamlit app',
              type: 'text',
            });
          },
        },
      ];
    default: {
      return [];
    }
  }
};
