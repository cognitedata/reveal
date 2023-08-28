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
} from '../infield-chains/utils';

export class DocumentQAQueryChain extends CogniteBaseChain {
  name = 'Search documents';
  description = copilotDestinationInfieldDocumentQueryPrompt.template;
  chain = 'llm' as const;

  stages: ChainStage[] = [
    {
      name: 'document query',
      loadingMessage: 'Inspecting document...',
      run: async ({ message, sdk }) => {
        // TODO: fetch from current context
        const externalAssetId = 'hr_docs';

        // Detecting language
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
          {
            _type: 'prompt',
            input_variables: ['input', 'context'],
            template_format: 'fstring',
            template: `
The query will be about HR questions.

As an information processor, you are required to answer a query solely \
based on the specific document data provided.
If there is any ambiguity in the query, you should state any assumptions you make.
Your response should rely entirely on the details and context found \
within this data subset and should not incorporate any external information or context.

In instances where the data subset does not contain the answer to the query, \
or the data you need is not provided, your response MUST be "WARNING REMOVE WARNING".
If the data cannot provide an answer, the only approved response is only "WARNING REMOVE WARNING"

Now, considering these guidelines, please answer the following query:
***{input}***
The required information for this question is found within the provided document data:
***{context}***

Ensure your answer is succinct, relevant, and anchored in the provided context.
Your response should exhibit an accurate understanding and application of the data given.
            `,
          },
          inputList,
          { timeout: 10000 }
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
            content: res,
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
