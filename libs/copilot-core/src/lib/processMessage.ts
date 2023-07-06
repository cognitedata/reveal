import { BaseChain } from 'langchain/chains';

import { langs } from './cogpilotGreeting';
import { getPageLanguage } from './toolchains/infield-chains/utils';
import { CopilotSupportedFeatureType, ProcessMessageFunc } from './types';

export const processMessage = async (
  feature: CopilotSupportedFeatureType | undefined,
  chain: BaseChain,
  ...params: Parameters<ProcessMessageFunc>
) => {
  //  when the user indicates an intention to do something, we have these tools available for the user.
  // based on their intent, make your best judgement on what tool is best suited for them and ask the user
  // switch case for the possibility to add specific functionality for each feature
  switch (feature) {
    case 'Infield': {
      const sendMessage = params[3];
      const message = params[1];
      if (message) {
        await chain.call({ input: message });
      } else {
        let msgContent =
          'Hello from CogPilot! How can I assist you with your Infield work today?';
        try {
          const pageLang = (await getPageLanguage()) as string;
          msgContent = langs[pageLang];
        } catch (e) {
          console.log(e);
        }
        sendMessage({
          type: 'text',
          content: msgContent,
        });
      }
      return true;
    }
    default: {
      const sendMessage = params[3];
      const message = params[1];
      if (message) {
        await chain.call({ input: message });
      } else {
        sendMessage({
          type: 'text',
          content: 'Hello from CogPilot! How can I assist you today?',
        });
      }
      return true;
    }
  }
};
