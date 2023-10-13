import { HRDocumentQuery } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';
import { SourceResponse } from '../../utils/types';
import { prepareSources } from '../infield/utils';

type Input = {
  prompt: string;
  sdk: CogniteClient;
};

export class HRQueryFlow extends Flow<Input, CopilotBotTextResponse> {
  label = 'Search HR documents';
  description = 'Find relevant HR documentation';

  run: Flow<Input, CopilotBotTextResponse>['run'] = async ({ prompt, sdk }) => {
    const { content, relevantDocuments } = await HRDocumentQuery.run({
      message: prompt,
      sdk,
    });

    return {
      type: 'text',
      content: content,
      fileLinks: relevantDocuments,
      chain: this.constructor.name,
    };
  };
  chatRun: Flow<Input, CopilotBotTextResponse>['chatRun'] = async (
    sendResponse,
    sendStatus
  ) => {
    if (this.fields?.prompt === undefined) {
      return {
        text: 'What would you like to know?',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.prompt = content;
        },
      };
    }
    sendStatus({ status: 'Finding answer in HR documents...' });
    sendResponse(await this.run(this.fields as Input));
    this.fields.prompt = undefined;
    return undefined;
  };
}
