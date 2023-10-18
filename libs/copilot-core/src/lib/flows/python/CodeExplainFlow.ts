import { ExplainPython } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';

type Fields = { code: string; sdk: CogniteClient };

export class CodeExplainFlow extends Flow<Fields, CopilotBotTextResponse> {
  label = 'Explain code';
  description = 'Provides description for python code';

  run: Flow<Fields, CopilotBotTextResponse>['run'] = async ({ code, sdk }) => {
    const { result: explaination } = await ExplainPython.run({
      query: '',
      message: code,
      sdk,
    });

    return {
      content: explaination,
      type: 'text',
    };
  };

  chatRun: Flow<Fields, CopilotBotTextResponse>['chatRun'] = async (
    sendResponse,
    sendStatus
  ) => {
    if (this.fields?.code === undefined) {
      return {
        text: 'Please provide the code',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.code = content;
        },
      };
    }
    sendStatus({ status: 'Explaining python code...' });
    sendResponse(await this.run(this.fields as Fields));
    this.fields.code = undefined;
    return undefined;
  };
}
