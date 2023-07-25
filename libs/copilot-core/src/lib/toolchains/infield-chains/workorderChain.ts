import {
  copilotDestinationInfieldWorkorderPrompt,
  infieldWorkorderPrompt,
} from '@cognite/llm-hub';

import {
  ChainStage,
  CogniteBaseChain,
  callPromptChain,
} from '../../CogniteBaseChain';
import { sendToCopilotEvent } from '../../utils';

import { getActivities, translateInputToEnglish } from './utils';

export class WorkorderChain extends CogniteBaseChain {
  description = copilotDestinationInfieldWorkorderPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'workorder',
      loadingMessage: 'Retrieving work orders...',
      run: async ({ message }) => {
        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        let language = langTrans.language;
        let input = langTrans.translation;

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving work orders...',
        });

        // Retrieving activities
        const activities = (await getActivities()) as string[];
        console.log(activities);

        let activityString: string = '';
        for (let i = 0; i < activities.length; i++) {
          activityString += JSON.stringify(activities[i]);
          if (i < activities.length - 1) {
            activityString += ';';
          }
        }

        const res = (
          await callPromptChain(
            this,
            infieldWorkorderPrompt,
            [
              {
                input: input,
                activities: activityString,
                language: language,
                date: new Date().toISOString(),
              },
            ],
            { timeout: 8000 }
          )
        )[0];

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: res,
            chain: this.constructor.name,
          },
        ]);

        return { data: res };
      },
    },
  ];
}
