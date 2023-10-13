import {
  copilotDestinationInfieldSummaryPrompt,
  InFieldDocumentSummaryChain,
} from '@cognite/llm-hub';
import { CogniteClient, Asset } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';
import { SourceResponse } from '../../utils/types';

import { prepareSources } from './utils';

type Input = {
  prompt: string;
  asset: Asset;
  sdk: CogniteClient;
};

export class InFieldDocumentSummaryFlow extends Flow<
  Input,
  CopilotBotTextResponse
> {
  label = 'Summarize documents';
  description = copilotDestinationInfieldSummaryPrompt.template;

  run: Flow<Input, CopilotBotTextResponse>['run'] = async ({
    prompt,
    sdk,
    asset,
  }) => {
    const { content, links } = await InFieldDocumentSummaryChain.run({
      asset,
      sdk,
      message: prompt,
    });

    // Return a list of the top 3 sources used to find the answer
    // Only 3 first sources as to not overwhelm the user
    const sourceList: SourceResponse[] = [];
    for (let i = 0; i < 3; i++) {
      sourceList.push({
        fileId: links[i].metadata.fileId,
        source: links[i].metadata.source,
        page: links[i].metadata.page,
        text: links[i].text,
        index: i,
      });
    }

    let { sourceString, openDocActionList } = prepareSources(sourceList);
    sourceString +=
      sourceList.length + 1 + '. Source: Gathered from properties';

    return {
      source: 'bot',
      type: 'text',
      content: content + `\n &nbsp; \n*(Asset: ${asset.name})*`,
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
    };
  };
}
