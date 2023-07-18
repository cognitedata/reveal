import {
  infieldDocumentSummaryPrompt,
  copilotDestinationInfieldSummaryPrompt,
} from '@cognite/llm-hub';

import {
  ChainStage,
  CogniteBaseChain,
  callPromptChain,
} from '../../CogniteBaseChain';
import { CopilotAction } from '../../types';
import { sendToCopilotEvent } from '../../utils';
import { sourceResponse } from '../../utils/types';
import { retrieveContext } from '../../utils/utils';

import { translateInputToEnglish, prepareSources } from './utils';

export class SummaryChain extends CogniteBaseChain {
  description = copilotDestinationInfieldSummaryPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'document query',
      loadingMessage: 'Creating summary...',
      run: async ({ message, sdk }) => {
        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        const language = langTrans.language;

        console.log('language', language);

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving information...',
        });

        //let externalAssetId = (await getExternalId()) as string;
        let externalAssetId = 'test1000_27JC0001'; //hardcoded for now, use line above when ready

        let queryContext = await retrieveContext(
          message,
          externalAssetId,
          sdk,
          'vectorstore' // 'ada' or 'vectorstore' embedding
        );

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Preparing an answer...',
        });

        let refinedResponse = '';
        for (let i = 0; i < queryContext.items.length; i++) {
          [refinedResponse] = (
            await callPromptChain(this, infieldDocumentSummaryPrompt, [
              {
                input: message,
                context: queryContext.items[i].text,
                prevAnswer: refinedResponse,
              },
            ])
          )[0];
          console.log(`Refined response ${i}: ` + refinedResponse);
        }

        // Return a list of the top 3 sources used to find the answer
        const sourceList: sourceResponse[] = [];
        for (let i = 0; i < 3; i++) {
          sourceList.push({
            source: queryContext.items[i].metadata.source,
            page: queryContext.items[i].metadata.page,
            text: queryContext.items[i].text,
            index: i,
          });
        }

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: refinedResponse,
            actions: [
              {
                content: 'Get source',
                onClick: () => {
                  const preparedSources = prepareSources(sourceList);
                  sendToCopilotEvent('NEW_MESSAGES', [
                    {
                      source: 'bot',
                      type: 'text',
                      content: preparedSources[0] as string,
                      actions: preparedSources[1] as CopilotAction[],
                    },
                  ]);
                },
              },
            ],
            chain: this.constructor.name,
          },
        ]);

        return { data: refinedResponse };
      },
    },
  ];
}
