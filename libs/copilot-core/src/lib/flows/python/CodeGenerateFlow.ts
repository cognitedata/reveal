import { GeneratePython } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotCodeResponse } from '../../types';

type Fields = { prompt: string; currentCode?: string; sdk: CogniteClient };

export class CodeGenerateFlow extends Flow<Fields, CopilotCodeResponse> {
  label = 'Generate code';
  description = 'Generate python code based on user input';

  run: Flow<Fields, CopilotCodeResponse>['run'] = async ({ prompt, sdk }) => {
    const { result: code } = await GeneratePython.run({
      query: prompt,
      message: prompt,
      sdk,
    });

    return {
      content: code,
      type: 'code',
      language: 'python',
    };
  };

  chatRun: Flow<Fields, CopilotCodeResponse>['chatRun'] = async (
    sendResponse,
    sendStatus
  ) => {
    if (this.fields?.prompt === undefined) {
      return {
        text: 'What would you like to have code for?',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.prompt = content;
        },
      };
    }
    sendStatus({ status: 'Generating python code...' });
    sendResponse(await this.run(this.fields as Fields));
    this.fields.prompt = undefined;
    return undefined;
  };
}
