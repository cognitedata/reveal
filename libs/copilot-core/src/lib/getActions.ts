import { sourceList } from './toolchains/infield-chains/documentQueryChain';
import {
  printSources,
  pushDocumentId,
} from './toolchains/infield-chains/utils';
import {
  CopilotAction,
  CopilotSupportedFeatureType,
  GetActionsFunc,
} from './types';

export const getActions = async (
  feature: CopilotSupportedFeatureType | undefined,
  ...params: Parameters<GetActionsFunc>
): Promise<CopilotAction[]> => {
  switch (feature) {
    case 'Streamlit':
      return [
        {
          content: 'Generate App',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                content: 'I want to generate a new Streamlit app',
                type: 'text',
                source: 'user',
              },
            ],
          ],
        },
      ];
    case 'Infield':
      return [
        {
          content: 'EXAMPLE INFIELD',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                content: 'What is the pressure coefficient of this asset?',
                type: 'text',
                source: 'user',
              },
            ],
          ],
        },
        {
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
