import {
  infieldDocumentSummaryPrompt,
  copilotDestinationInfieldSummaryPrompt,
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
  getExternalId,
  runInfieldStartUp,
  externalAssetIdGlobal,
  assetDescriptionGlobal,
} from './utils';

export class DocumentSummaryChain extends CogniteBaseChain {
  name = 'Summarize documents';
  description = copilotDestinationInfieldSummaryPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'document query',
      loadingMessage: 'Creating summary...',
      run: async ({ message, sdk }) => {
        const externalAssetId = (await getExternalId()) as string;
        if (externalAssetId !== externalAssetIdGlobal) {
          await runInfieldStartUp(externalAssetId, sdk, this);
        }

        //Detecting language
        const langTrans = await translateInputToEnglish(this, message);
        const language = langTrans.language;
        const input = langTrans.translation;

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Retrieving information...',
        });

        let queryContext = await retrieveContext(
          input,
          externalAssetId,
          sdk,
          'vectorstore' // 'ada' or 'vectorstore' embedding
        );

        sendToCopilotEvent('LOADING_STATUS', {
          status: 'Preparing an answer...',
        });

        let refinedResponse = '';

        // Starts of the refining from properties of the asset
        refinedResponse = (
          await callPromptChain(
            this,
            'summarize document',
            infieldDocumentSummaryPrompt,
            [
              {
                input: input,
                context: assetDescriptionGlobal,
                prevAnswer: refinedResponse,
                language: 'English',
              },
            ]
          )
        )[0];

        // Safely determining number of documents to query
        const numDocuments = Math.min(queryContext.items.length, 5);
        for (let i = 0; i < numDocuments; i++) {
          refinedResponse = (
            await callPromptChain(
              this,
              `summarize document - ${i + 1}`,
              infieldDocumentSummaryPrompt,
              [
                {
                  input: message,
                  context: queryContext.items[i].text,
                  prevAnswer: refinedResponse,
                  language: i === numDocuments - 1 ? language : 'English',
                },
              ],
              { timeout: 5000 }
            )
          )[0];
        }

        // Return a list of the top 3 sources used to find the answer
        // Only 3 first sources as to not overwhelm the user
        const sourceList: sourceResponse[] = [];
        for (let i = 0; i < 3; i++) {
          sourceList.push({
            fileId: queryContext.items[i].metadata.fileId,
            source: queryContext.items[i].metadata.source,
            page: queryContext.items[i].metadata.page,
            text: queryContext.items[i].text,
            index: i,
          });
        }

        let { sourceString, openDocActionList } = prepareSources(sourceList);
        sourceString +=
          sourceList.length + 1 + '. Source: Gathered from properties';
        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content:
              refinedResponse +
              `\n &nbsp; \n*(Asset: ${externalAssetIdGlobal})*`,
            actions: [
              {
                content: 'Source',
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

        return { data: { refinedResponse } };
      },
    },
  ];
}
