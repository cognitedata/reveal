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
import { sendToCopilotEvent } from '../../utils';
import { sourceResponse } from '../../utils/types';
import { retrieveContext } from '../../utils/utils';

import {
  translateInputToEnglish,
  prepareSources,
  prepareRelevantSoruces,
  getExternalId,
  runInfieldStartUp,
  externalAssetIdGlobal,
  assetDescriptionGlobal,
} from './utils';

export class DocumentQueryChain extends CogniteBaseChain {
  name = 'Search documents';
  description = copilotDestinationInfieldDocumentQueryPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'document query',
      loadingMessage: 'Inspecting document...',
      run: async ({ message, sdk }) => {
        const externalAssetId = (await getExternalId()) as string;
        if (externalAssetId !== externalAssetIdGlobal) {
          await runInfieldStartUp(externalAssetId, sdk, this);
        }

        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        const language = langTrans.language;
        let input = langTrans.translation;

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving information...',
        });

        let queryContext = await retrieveContext(
          input,
          externalAssetId,
          sdk,
          'vectorstore' // 'ada' or 'vectorstore' embedding
        );

        // Safely determining number of documents to query
        const numDocuments = Math.min(queryContext.items.length, 5);
        const inputList = queryContext.items
          .slice(0, numDocuments)
          .map((i) => ({
            input: message,
            context: i.text,
          }));

        // Includes a single call to extract from asset properties
        inputList.push({ input: message, context: assetDescriptionGlobal });

        const tempAnswers = await callPromptChain(
          this,
          'extract text',
          infieldDocumentSingleContextQueryPrompt,
          inputList,
          { timeout: 4000 }
        );
        const returnedAnswers = tempAnswers.slice(0, numDocuments);
        let propertiesAnswer = tempAnswers[numDocuments];

        // A list that can be used later on to find source of answers
        const sourceList: sourceResponse[] = [];

        let stringOfAnswers = '';
        for (let j = 0; j < returnedAnswers.length; j++) {
          if (
            !returnedAnswers[j].includes('WARNING REMOVE WARNING') &&
            returnedAnswers[j] !== ''
          ) {
            const source: sourceResponse = {
              fileId: queryContext.items[j].metadata.fileId,
              source: queryContext.items[j].metadata.source,
              page: queryContext.items[j].metadata.page,
              text: returnedAnswers[j],
              index: j,
            };
            stringOfAnswers += returnedAnswers[j] + '\n\n';
            sourceList.push(source);
          }
        }
        propertiesAnswer = propertiesAnswer.includes('WARNING REMOVE WARNING')
          ? ''
          : propertiesAnswer;
        stringOfAnswers = stringOfAnswers + propertiesAnswer;

        let context = stringOfAnswers;

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Preparing an answer...',
        });

        const emptyAnswerCheck =
          stringOfAnswers === '' && propertiesAnswer === '';
        let res, sourceString, openDocActionList;

        if (emptyAnswerCheck) {
          const ans = prepareRelevantSoruces(queryContext);
          sourceString = ans.sourceString;
          openDocActionList = ans.openDocActionList;
          res = "I'm sorry, I could not find an answer to your question.";
        } else {
          // Final call for summarizing answers
          const ans = prepareSources(sourceList);
          sourceString =
            ans.sourceString +
            (propertiesAnswer !== ''
              ? sourceList.length + 1 + '. Gathered from properties'
              : '');
          openDocActionList = ans.openDocActionList;
          res = (
            await callPromptChain(
              this,
              'summarize text',
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
        }

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: res + `\n &nbsp; \n*(Asset: ${externalAssetIdGlobal})*`,
            actions: [
              {
                content: !emptyAnswerCheck ? 'Source' : 'Relevant sources',
                toCopilotEvent: [
                  'NEW_MESSAGES',
                  [
                    {
                      source: 'bot',
                      type: 'text',
                      content: sourceString,
                      actions: openDocActionList,
                    },
                  ],
                ],
              },
            ],
            chain: this.constructor.name,
          },
        ]);

        return { data: { res } };
      },
    },
  ];
}
