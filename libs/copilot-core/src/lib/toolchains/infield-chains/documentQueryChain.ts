import {
  copilotDestinationInfieldDocumentQueryPrompt,
  infieldDocumentMultipleContextQueryPrompt,
  infieldDocumentSingleContextQueryPrompt,
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

export let sourceList: sourceResponse[] = [];

export class DocumentQueryChain extends CogniteBaseChain {
  description = copilotDestinationInfieldDocumentQueryPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'document query',
      loadingMessage: 'Inspecting document...',
      run: async ({ message, sdk }) => {
        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        let language = langTrans.language;
        let input = langTrans.translation;

        console.log({ language, input, message });

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving information...',
        });

        //let externalAssetId = (await getExternalId()) as string;
        let externalAssetId = 'test500_27JC0001'; //hardcoded for now, use line above when ready

        let queryContext = await retrieveContext(
          message,
          externalAssetId,
          sdk,
          'vectorstore' // 'ada' or 'vectorstore' embedding
        );
        console.log(queryContext);

        // Generating answers prompt and chain initialization
        const numDocuments = 5; // queryContext.items.length; // Can be specified
        const inputList = queryContext.items
          .slice(0, numDocuments)
          .map((i) => ({ input: message, context: i.text }));

        const returnedAnswers = await callPromptChain(
          this,
          infieldDocumentSingleContextQueryPrompt,
          inputList
        );

        // Summarize answer prompt and chain initialization
        console.log(returnedAnswers);
        // A list that can be used later on to find source of answers
        const sourceList: sourceResponse[] = [];

        let stringOfAnswers = '';
        for (let j = 0; j < returnedAnswers.length; j++) {
          if (!returnedAnswers[j].includes('WARNING REMOVE WARNING')) {
            const source: sourceResponse = {
              source: queryContext.items[j].metadata.source,
              page: queryContext.items[j].metadata.page,
              text: returnedAnswers[j],
              index: j,
            };
            stringOfAnswers += returnedAnswers[j] + '\n\n';
            sourceList.push(source);
          }
        }
        let context = stringOfAnswers;
        console.log(context);
        console.log(sourceList);

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Preparing an answer...',
        });

        // Final call for summarizing answers
        const res = (
          await callPromptChain(
            this,
            infieldDocumentMultipleContextQueryPrompt,
            [
              {
                input: message,
                context: context,
                language: language,
              },
            ],
            { timeout: 8000 } // 8 seconds now to ensure that we almost always get an answer. Can definitely be lowered later on.
          )
        )[0];

        // Implement check for whether you want to be sent to the document
        // pushDocumentId('446078535171616'); // Should be the document id of where the information was found

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: res,
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

        return { data: res };
      },
    },
  ];
}
