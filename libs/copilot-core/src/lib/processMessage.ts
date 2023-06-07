import { processMessageStreamlit } from './features/streamlit/processMessage';
import { CopilotSupportedFeatureType, ProcessMessageFunc } from './types';

export const processMessage = async (
  feature: CopilotSupportedFeatureType | undefined,
  ...params: Parameters<ProcessMessageFunc>
) => {
  switch (feature) {
    case 'Streamlit':
      return processMessageStreamlit(...params);
    default: {
      const sendMessage = params[2];
      sendMessage({
        type: 'text',
        content:
          'Hello from Cogpilot! Currently we do not support features on this page yet.',
      });
      sendMessage({
        type: 'text',
        content:
          'If you would like to see AI assistance here, please give a request on Cognite Hub and we will get right back to you!',
      });
      return false;
    }
  }
};
