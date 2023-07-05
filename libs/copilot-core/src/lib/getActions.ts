import { sourceList } from './toolchains/infield-chains/documentQueryChain';
import {
  printSources,
  pushDocumentId,
} from './toolchains/infield-chains/utils';
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
    case 'Infield':
      return [
        {
          type: 'EXAMPLE_INFIELD',
          name: 'EXAMPLE INFIELD',
          content: 'EXAMPLE INFIELD',
          onClick: async () => {
            params[2]({
              content: 'What is the pressure coefficient of this asset?',
              type: 'text',
            });
          },
        },
        {
          type: 'GET_SOURCE',
          name: 'GET_SOURCE',
          content: 'Get source',
          onClick: async () => {
            if (params[1].length > 1) {
              printSources(sourceList);
              pushDocumentId('446078535171616');
            }
          },
        },
      ];
    default: {
      return [];
    }
  }
};
