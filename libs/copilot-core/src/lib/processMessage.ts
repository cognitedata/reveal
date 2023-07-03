import { ConversationChain, MultiPromptChain } from 'langchain/chains';

import { CopilotSupportedFeatureType, ProcessMessageFunc } from './types';

export const processMessage = async (
  feature: CopilotSupportedFeatureType | undefined,
  chain: ConversationChain | MultiPromptChain,
  ...params: Parameters<ProcessMessageFunc>
) => {
  //  when the user indicates an intention to do something, we have these tools available for the user.
  // based on their intent, make your best judgement on what tool is best suited for them and ask the user

  switch (feature) {
    default: {
      const sendMessage = params[3];
      const message = params[1];
      if (message) {
        await chain.call({
          input: message,
          sdk: params[0],
          pastMessages: params[2],
        });
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
