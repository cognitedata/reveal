import { sourceList } from './toolchains/infield-chains/documentQueryChain';
import {
  CopilotAction,
  CopilotSupportedFeatureType,
  GetActionsFunc,
} from './types';

export const getActions = async (
  feature: CopilotSupportedFeatureType | undefined,
  ..._params: Parameters<GetActionsFunc>
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
                content: 'Tell me about the general safety rules',
                type: 'text',
                source: 'user',
              },
            ],
          ],
        },
      ];
    default: {
      return [];
    }
  }
};
