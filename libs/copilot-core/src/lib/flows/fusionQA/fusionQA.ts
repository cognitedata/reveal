import { FusionQAChain } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';
type Input = { prompt: string; sdk: CogniteClient };

export class FusionQAFlow extends Flow<Input, CopilotBotTextResponse> {
  label = 'Inquire about CDF';
  description = 'Answer questions about CDF';

  run: Flow<Input, CopilotBotTextResponse>['run'] = async ({ prompt, sdk }) => {
    const { content, relevantDocuments } = await FusionQAChain.run({
      message: prompt,
      sdk,
    });
    return {
      type: 'text',
      content: content,
      links: relevantDocuments,
      chain: this.constructor.name,
    };
  };
  chatRun: Flow<Input, CopilotBotTextResponse>['chatRun'] = async (
    sendResponse,
    sendStatus
  ) => {
    if (this.fields?.prompt === undefined) {
      return {
        text: 'What would like you like to know about CDF?',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.prompt = content;
        },
      };
    }
    sendStatus({ status: 'Finding answer...' });
    sendResponse(await this.run(this.fields as Input));
    this.fields.prompt = undefined;
    return undefined;
  };
}
