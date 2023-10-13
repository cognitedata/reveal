import {
  InFieldDocumentQueryChain,
  copilotDestinationInfieldDocumentQueryPrompt,
} from '@cognite/llm-hub';
import { Asset, CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';
import { SourceResponse } from '../../utils/types';

import { prepareSources } from './utils';

type Input = {
  prompt: string;
  asset: Asset;
  sdk: CogniteClient;
};

export class InFieldDocumentQueryFlow extends Flow<
  Input,
  CopilotBotTextResponse
> {
  label = 'Search documents';
  description = copilotDestinationInfieldDocumentQueryPrompt.template;

  run: Flow<Input, CopilotBotTextResponse>['run'] = async ({
    prompt,
    sdk,
    asset,
  }) => {
    let res, sourceString, openDocActionList;

    try {
      const { content, links } = await InFieldDocumentQueryChain.run({
        message: prompt,
        sdk,
        asset: asset,
        namespace: asset.externalId!,
      });

      const sourceList: SourceResponse[] = [];

      for (let j = 0; j < links.length; j++) {
        const source: SourceResponse = {
          fileId: links[j].metadata.fileId,
          source: links[j].metadata.source,
          page: links[j].metadata.page,
          text: links[j].text,
          index: j,
        };
        sourceList.push(source);
      }
      // Final call for summarizing answers
      const ans = prepareSources(sourceList);
      res = content;
      openDocActionList = ans.openDocActionList;
    } catch (e) {
      res = "I'm sorry, I could not find an answer to your question.";
    }

    return {
      type: 'text',
      content: res + `\n &nbsp; \n*(Asset: ${asset.name})*`,
      actions: openDocActionList
        ? [
            {
              content: 'Relevant sources',
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
          ]
        : [],
      chain: this.constructor.name,
    };
  };
}
