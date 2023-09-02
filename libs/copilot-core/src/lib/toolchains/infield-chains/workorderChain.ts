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

import {
  externalAssetIdGlobal,
  getActivities,
  getExternalId,
  runInfieldStartUp,
  translateInputToEnglish,
} from './utils';

export class WorkorderChain extends CogniteBaseChain {
  name = 'Find workorders';
  description = copilotDestinationInfieldWorkorderPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'Workorder',
      loadingMessage: 'Retrieving work orders...',
      run: async ({ message, sdk }) => {
        const externalAssetId = (await getExternalId()) as string;
        if (externalAssetId !== externalAssetIdGlobal) {
          await runInfieldStartUp(externalAssetId, sdk, this);
        }

        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        let language = langTrans.language;
        let input = langTrans.translation;

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving work orders...',
        });

        // Retrieving activities
        const activities = (await getActivities()) as string[];
        let tooMuchInformationCheck = false;
        const maxActivityLength = 12000;

        const activityStringList = [];
        let activityString: string = '';
        for (let i = 0; i < activities.length; i++) {
          activityString += JSON.stringify(activities[i]);
          if (i < activities.length - 1) {
            activityString += '; ';
          }

          if (activityString.length > maxActivityLength) {
            activityStringList.push(activityString);
            activityString = '';
          }
          // How many splits should we include, 1 for now, but can be increased with summary call in the end
          if (activityStringList.length > 1) {
            tooMuchInformationCheck = true;
            break;
          }
        }
        if (activityString !== '') {
          activityStringList.push(activityString);
        }

        const inputList = activityStringList.map((activityString) => ({
          input: input,
          activities: activityString,
          language: language,
          date: new Date().toISOString(),
        }));

        const res = await callPromptChain(
          this,
          'identify workorders',
          infieldWorkorderPrompt,
          inputList,
          {
            timeout: 12000,
          }
        );

        let result: string = '';

        if (res.length > 1) {
          // NEED TO HAVE A SUMMARY CALL OF SORTS HERE!!!!!!!! CONCATENATE FOR NOW
          //
          result = res.join('\n');
          //
          // NEED TO HAVE A SUMMARY CALL OF SORTS HERE!!!!!!!! CONCATENATE FOR NOW
        } else {
          result = res[0];
        }

        result =
          (tooMuchInformationCheck
            ? `Too many work orders, using those with the soonest end time: \n &nbsp; \n` // Can be edited to also reflect the page language
            : '') +
          result +
          `\n &nbsp; \n*(Asset: ${externalAssetIdGlobal})*`;

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: result,
            chain: this.constructor.name,
            actions: [
              {
                content: 'Source',
                toCopilotEvent: [
                  'NEW_MESSAGES',
                  [
                    {
                      source: 'bot',
                      type: 'text',
                      content: '1. Gathered from workorders',
                    },
                  ],
                ],
              },
            ],
          },
        ]);

        return { data: { res } };
      },
    },
  ];
}
