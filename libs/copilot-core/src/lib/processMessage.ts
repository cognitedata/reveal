import { BaseChain } from 'langchain/chains';

import { greetingLangs } from './cogpilotGreeting';
import { getPageLanguage } from './toolchains/infield-chains/utils';
import {
  CopilotSupportedFeatureType,
  ProcessMessageFunc,
  ActionType,
} from './types';
import { sendToCopilotEvent } from './utils';

export const processMessage = async (
  feature: CopilotSupportedFeatureType | undefined,
  chain: BaseChain,
  ...params: Parameters<ProcessMessageFunc>
): Promise<ActionType> => {
  //  when the user indicates an intention to do something, we have these tools available for the user.
  // based on their intent, make your best judgement on what tool is best suited for them and ask the user
  // switch case for the possibility to add specific functionality for each feature
  switch (feature) {
    case 'Infield': {
      let message = params[1];
      if (message) {
        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Reasoning next steps...',
        });
        message = inputCleaning(message);
        try {
          await chain.call({ input: message });
        } catch (error) {
          sendToCopilotEvent('NEW_MESSAGES', [
            {
              type: 'text',
              content: 'ERROR: Please try again.',
              source: 'bot',
              chain: 'Error',
            },
          ]);
        }
        return 'Message';
      } else {
        let msgContent =
          'Hello from CogPilot! How can I assist you with your Infield work today?';
        try {
          const pageLang = (await getPageLanguage()) as string;
          msgContent = greetingLangs[pageLang];
        } catch (e) {
          console.log(e);
        }

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            type: 'text',
            content: msgContent,
            source: 'bot',
            chain: 'Welcome',
          },
        ]);
        return 'ChainSelection';
      }
    }
    default: {
      const message = params[1];
      const messageIndex = params[2].length - 1;
      if (message) {
        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Reasoning next steps...',
        });
        await chain.call({ input: message, key: `${params[2].length - 1}` });
        sendToCopilotEvent('NEW_MESSAGES', [
          {
            ...params[2][messageIndex],
            key: messageIndex,
            pending: false,
          },
        ]);
        return 'Message';
      } else {
        sendToCopilotEvent('NEW_MESSAGES', [
          {
            type: 'text',
            content: 'Hello from CogPilot! How can I assist you today?',
            source: 'bot',
            chain: 'Welcome',
          },
        ]);
        return 'ChainSelection';
      }
    }
  }
};

//Maybe put somewhere else?
//Clean up the input message
const inputCleaning = (message: string) => {
  // remove all emojis
  message = message.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  );
  // remove all extra spaces
  message = message.replace(/\s{2,}/g, ' ');
  // remove all extra newlines
  message = message.replace(/\n{2,}/g, '\n');
  // remove all extra tabs
  message = message.replace(/\t{2,}/g, '\t');
  // remove all extra carriage returns
  message = message.replace(/\r{2,}/g, '\r');
  return message;
};
