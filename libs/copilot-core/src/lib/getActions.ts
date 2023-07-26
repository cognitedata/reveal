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
          content: 'Test 1',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                content: 'What is this asset?',
                type: 'text',
                source: 'user',
              },
            ],
          ],
        },
        {
          content: 'Test 2',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                content: 'What is the weight?',
                type: 'text',
                source: 'user',
              },
            ],
          ],
        },
        {
          content: 'Test 3',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                content: 'What is the x-3456-jdsfdsfsd of this asset?',
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
